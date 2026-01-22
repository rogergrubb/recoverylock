import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';

const getStripe = () => {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) return null;
  return new Stripe(key, {
    apiVersion: '2025-12-15.clover',
  });
};

export async function POST(request: NextRequest) {
  const stripe = getStripe();
  
  if (!stripe) {
    // Return inactive if Stripe not configured
    return NextResponse.json({ active: false, status: 'none' });
  }
  
  try {
    const body = await request.json();
    const { sessionId, email } = body;

    // If we have a session ID, verify the checkout was successful
    if (sessionId) {
      const session = await stripe.checkout.sessions.retrieve(sessionId);
      
      if (session.payment_status === 'paid' || session.status === 'complete') {
        const subscription = await stripe.subscriptions.retrieve(
          session.subscription as string
        ) as Stripe.Subscription;
        
        return NextResponse.json({
          active: subscription.status === 'active' || subscription.status === 'trialing',
          status: subscription.status,
          customerId: session.customer,
          subscriptionId: subscription.id,
          currentPeriodEnd: subscription.items.data[0]?.current_period_end,
          cancelAtPeriodEnd: subscription.cancel_at_period_end,
          trialEnd: subscription.trial_end,
        });
      }
    }

    // If we have an email, look up their subscription
    if (email) {
      const customers = await stripe.customers.list({
        email,
        limit: 1,
      });

      if (customers.data.length > 0) {
        const customer = customers.data[0];
        const subscriptions = await stripe.subscriptions.list({
          customer: customer.id,
          status: 'all',
          limit: 1,
        });

        if (subscriptions.data.length > 0) {
          const subscription = subscriptions.data[0];
          return NextResponse.json({
            active: subscription.status === 'active' || subscription.status === 'trialing',
            status: subscription.status,
            customerId: customer.id,
            subscriptionId: subscription.id,
            currentPeriodEnd: subscription.items.data[0]?.current_period_end,
            cancelAtPeriodEnd: subscription.cancel_at_period_end,
            trialEnd: subscription.trial_end,
          });
        }
      }
    }

    // No subscription found
    return NextResponse.json({
      active: false,
      status: 'none',
    });
  } catch (error) {
    console.error('Status check error:', error);
    return NextResponse.json(
      { error: 'Failed to check subscription status' },
      { status: 500 }
    );
  }
}
