/**
 * GoodLeap / LoanPal integration via browser-tab relay.
 *
 * Reverse-engineered from the origin.goodleap.com "New customer form" flow:
 *
 *   POST https://integration.api.loanpal.com/graphql
 *   Headers: authorization: Bearer <JWT>, x-client-metadata: <JWT>, content-type: application/json
 *
 * Two queries are used to price a loan:
 *
 *   GET_PRODUCTS(groupCode, categoryId)
 *     Returns products → offers with { id, rate, term, dealerFees, ... }.
 *     groupCode encodes the dealer fee channel, e.g. "CA_699" = California / 6.99% channel.
 *     categoryId for solar is hard-coded in GoodLeap's partner portal.
 *
 *   CALCULATE(amount, offerId, enrollments: ["AUTOPAY"])
 *     Returns estimatePayments.payments[0].labels.estimatedAmount (e.g. "$265.48").
 *
 * Auth headers come from the live origin.goodleap.com tab via the relay result
 * (the relay loop in the tab captures them from the app's own fetch calls and
 * attaches them to each backend-initiated request).
 */
import { enqueue, RelayResponse } from './lightreachRelay';
import logger from '../utils/logger';

// Solar category id — stable across all partner orgs (reverse-engineered from GET_PRODUCTS).
const SOLAR_CATEGORY_ID = '3b4acb46-e937-4bee-b134-a54c36568536';

// Default channel for California — 6.99% dealer fee. Override via input.channel.
const DEFAULT_GROUP_CODE = 'CA_699';

const GRAPHQL_URL = 'https://integration.api.loanpal.com/graphql';

const GET_PRODUCTS_QUERY = `query GET_PRODUCTS($groupCode: String!, $categoryId: String!, $orgId: ID) {
  products(
    input: {filters: {groupCode: $groupCode, categoryId: $categoryId, orgId: $orgId}, includeOffersWithRanges: true}
  ) {
    edges {
      node {
        id
        description
        code
        name
        offerConnection {
          edges {
            node {
              id
              rate
              baseRate
              term
              __typename
            }
            __typename
          }
          __typename
        }
        __typename
      }
      __typename
    }
    __typename
  }
}`;

const CALCULATE_QUERY = `query CALCULATE($amount: Float!, $offerId: ID!, $additionalPaydownAmount: Float, $enrollments: [EnrollmentType!]!, $organizationId: ID) {
  estimatePayments(
    input: {amount: $amount, offerId: $offerId, additionalPaydownAmount: $additionalPaydownAmount, organizationId: $organizationId, currencyType: USD, enrollments: $enrollments, includePaymentRange: true}
  ) {
    projectCost
    estimatedLoanAmount
    payments {
      order
      labels {
        title
        interval
        estimatedAmount
        actualAmount
        __typename
      }
      __typename
    }
    totalPaydown
    __typename
  }
}`;

export interface GoodLeapQuoteInput {
  state: string; // two-letter, e.g. "CA"
  channel?: number; // e.g. 699 for 6.99% dealer fee. Default 699.
  loanAmount: number;
  termYears?: number; // 7, 10, 20. Default 20 (lowest payment).
}

export interface GoodLeapQuoteResult {
  monthlyPayment: number;
  term: number;
  apr: number;
  loanAmount: number;
  offerId: string;
}

async function gql(query: string, variables: any, operationName: string): Promise<RelayResponse> {
  return enqueue({
    target: 'goodleap',
    method: 'POST',
    path: GRAPHQL_URL,
    body: { operationName, variables, query },
  });
}

function parseMoney(s: string | undefined): number {
  if (!s) return 0;
  return Number(String(s).replace(/[^0-9.]/g, ''));
}

export async function getOffers(groupCode: string) {
  const res = await gql(GET_PRODUCTS_QUERY, { groupCode, categoryId: SOLAR_CATEGORY_ID }, 'GET_PRODUCTS');
  if (res.status >= 400) {
    throw new Error(`GoodLeap GET_PRODUCTS failed ${res.status}: ${JSON.stringify(res.body).slice(0, 300)}`);
  }
  const products = res.body?.data?.products?.edges || [];
  // Flatten to a list of offers with term info
  const offers: Array<{ offerId: string; rate: number; term: number; productName: string }> = [];
  for (const p of products) {
    const node = p?.node;
    for (const oe of node?.offerConnection?.edges || []) {
      const on = oe?.node;
      if (on?.id && on?.term) {
        offers.push({ offerId: on.id, rate: on.rate, term: on.term, productName: node?.name || '' });
      }
    }
  }
  return offers;
}

export async function calculatePayment(amount: number, offerId: string): Promise<{ monthlyPayment: number; loanAmount: number }> {
  const res = await gql(CALCULATE_QUERY, {
    amount,
    offerId,
    additionalPaydownAmount: null,
    enrollments: ['AUTOPAY'],
  }, 'CALCULATE');
  if (res.status >= 400) {
    throw new Error(`GoodLeap CALCULATE failed ${res.status}: ${JSON.stringify(res.body).slice(0, 300)}`);
  }
  const ep = res.body?.data?.estimatePayments;
  const label = ep?.payments?.[0]?.labels?.estimatedAmount;
  return {
    monthlyPayment: parseMoney(label),
    loanAmount: ep?.estimatedLoanAmount || amount,
  };
}

export async function quoteLoan(input: GoodLeapQuoteInput): Promise<GoodLeapQuoteResult> {
  const groupCode = `${input.state.toUpperCase()}_${input.channel || 699}`;
  logger.info('[goodleap] quoteLoan start', { groupCode, loanAmount: input.loanAmount });

  const offers = await getOffers(groupCode);
  if (!offers.length) throw new Error('GoodLeap: no offers returned');

  // Pick the offer matching the requested term, or fallback to the longest term (lowest payment)
  const desiredTerm = input.termYears || 20;
  let offer = offers.find(o => o.term === desiredTerm);
  if (!offer) offer = offers.sort((a, b) => b.term - a.term)[0];

  const { monthlyPayment, loanAmount } = await calculatePayment(input.loanAmount, offer.offerId);

  return {
    monthlyPayment,
    term: offer.term,
    apr: offer.rate,
    loanAmount,
    offerId: offer.offerId,
  };
}
