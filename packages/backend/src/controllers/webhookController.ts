import { Request, Response } from 'express';
import { query } from '../config/database';
import logger from '../utils/logger';
import { success, error as errorResponse } from '../utils/apiResponse';
import { updateDealStage } from '../services/hubspot';

export const handleDocuSignWebhook = async (req: Request, res: Response) => {
  try {
    const { data } = req.body;

    if (!data || !data.envelopeId) {
      return res.status(400).json(errorResponse('Invalid webhook payload', 400));
    }

    const envelopeId = data.envelopeId;
    const status = data.status;

    const dealResult = await query(
      'SELECT id FROM deals WHERE docusign_envelope_id = $1',
      [envelopeId]
    );

    if (!dealResult.rows.length) {
      logger.warn('DocuSign envelope not found', { envelopeId });
      return res.status(404).json(errorResponse('Deal not found', 404));
    }

    const dealId = dealResult.rows[0].id;

    if (status === 'completed') {
      await query(
        'UPDATE deals SET stage = $1, docusign_status = $2 WHERE id = $3',
        ['signed', 'completed', dealId]
      );
      logger.info('Deal signed via DocuSign', { dealId, envelopeId });
    } else if (status === 'declined') {
      await query(
        'UPDATE deals SET stage = $1, docusign_status = $2 WHERE id = $3',
        ['cancelled', 'declined', dealId]
      );
      logger.info('DocuSign envelope declined', { dealId, envelopeId });
    }

    res.json(success({ processed: true }));
  } catch (err) {
    logger.error('DocuSign webhook error', { error: err });
    res.status(500).json(errorResponse('Internal server error', 500));
  }
};

export const handleLenderWebhook = async (req: Request, res: Response) => {
  try {
    const { dealId, status, approvalAmount } = req.body;

    if (!dealId || !status) {
      return res.status(400).json(errorResponse('Missing required fields', 400));
    }

    const deal = await query(
      'SELECT * FROM deals WHERE id = $1',
      [dealId]
    );

    if (!deal.rows.length) {
      return res.status(404).json(errorResponse('Deal not found', 404));
    }

    if (status === 'approved') {
      await query(
        'UPDATE deals SET stage = $1, lender_approval_amount = $2 WHERE id = $3',
        ['payment_pending', approvalAmount, dealId]
      );
      logger.info('Lender approval received', { dealId, approvalAmount });
    } else if (status === 'denied') {
      await query(
        'UPDATE deals SET stage = $1 WHERE id = $2',
        ['cancelled', dealId]
      );
      logger.info('Lender denied financing', { dealId });
    }

    res.json(success({ processed: true }));
  } catch (err) {
    logger.error('Lender webhook error', { error: err });
    res.status(500).json(errorResponse('Internal server error', 500));
  }
};

export const handleTwilioWebhook = async (req: Request, res: Response) => {
  try {
    const { MessageSid, MessageStatus, From } = req.body;

    logger.info('SMS status update', {
      messageSid: MessageSid,
      status: MessageStatus,
      from: From,
    });

    res.status(200).send('');
  } catch (err) {
    logger.error('Twilio webhook error', { error: err });
    res.status(500).json(errorResponse('Internal server error', 500));
  }
};

export const handleStripeWebhook = async (req: Request, res: Response) => {
  try {
    const { type, data } = req.body;

    if (type === 'payment_intent.succeeded') {
      const paymentIntentId = data.object.id;
      const dealId = data.object.metadata?.deal_id;

      if (dealId) {
        await query(
          'UPDATE deals SET payment_status = $1, payment_intent_id = $2 WHERE id = $3',
          ['paid', paymentIntentId, dealId]
        );
        logger.info('Payment received', { dealId, paymentIntentId });
      }
    }

    res.json(success({ processed: true }));
  } catch (err) {
    logger.error('Stripe webhook error', { error: err });
    res.status(500).json(errorResponse('Internal server error', 500));
  }
};

export default {
  handleDocuSignWebhook,
  handleLenderWebhook,
  handleTwilioWebhook,
  handleStripeWebhook,
};
