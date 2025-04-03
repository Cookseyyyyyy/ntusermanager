import { useState, useEffect } from 'react';
import { 
  getSubscriptionTier, 
  getSubscriptionDetails, 
  createStripePortalSession,
  createStripeCheckoutSession
} from '../../services/api';

function SubscriptionManagement() {
  const [subscriptionTier, setSubscriptionTier] = useState(null);
  const [subscriptionDetails, setSubscriptionDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [portalLoading, setPortalLoading] = useState(false);
  const [checkoutLoading, setCheckoutLoading] = useState(false);

  useEffect(() => {
    fetchSubscriptionData();
  }, []);

  const fetchSubscriptionData = async () => {
    setLoading(true);
    setError('');
    
    try {
      // Fetch both subscription tier and details
      const [tierResponse, detailsResponse] = await Promise.all([
        getSubscriptionTier(),
        getSubscriptionDetails()
      ]);
      
      if (tierResponse.data.status === 'success') {
        setSubscriptionTier(tierResponse.data.data.tier);
      }
      
      if (detailsResponse.data.status === 'success') {
        setSubscriptionDetails(detailsResponse.data.data.subscription);
      }
    } catch (err) {
      setError('Failed to load subscription information: ' + (err.response?.data?.message || err.message));
    } finally {
      setLoading(false);
    }
  };

  const handleManageSubscription = async () => {
    setPortalLoading(true);
    setError('');
    
    try {
      const response = await createStripePortalSession();
      
      if (response.data.status === 'success' && response.data.data.url) {
        // Open Stripe Portal in a new tab
        window.open(response.data.data.url, '_blank');
      } else {
        setError('Failed to access subscription portal');
      }
    } catch (err) {
      setError('Failed to access subscription portal: ' + (err.response?.data?.message || err.message));
    } finally {
      setPortalLoading(false);
    }
  };

  const handleUpgradeSubscription = async () => {
    setCheckoutLoading(true);
    setError('');
    
    try {
      const priceId = 'price_1R9kchGKqHXhKBbWczq1A9eS'; // Using the provided price ID
      const response = await createStripeCheckoutSession(priceId);
      
      if (response.data.status === 'success' && response.data.data.url) {
        // Open Stripe Checkout in a new tab
        window.open(response.data.data.url, '_blank');
      } else {
        setError('Failed to create checkout session');
      }
    } catch (err) {
      setError('Failed to upgrade subscription: ' + (err.response?.data?.message || err.message));
    } finally {
      setCheckoutLoading(false);
    }
  };

  // Format date to local date string
  const formatDate = (timestamp) => {
    if (!timestamp) return 'N/A';
    return new Date(timestamp).toLocaleDateString();
  };

  // Helper to get tier name
  const getTierName = (tier) => {
    switch(tier) {
      case 'free': return 'Free Tier';
      case 'basic': return 'Basic Plan';
      case 'pro': return 'Professional Plan';
      case 'enterprise': return 'Enterprise Plan';
      default: return tier ? tier.charAt(0).toUpperCase() + tier.slice(1) : 'Free Tier';
    }
  };

  if (loading) {
    return <div className="loading">Loading subscription information...</div>;
  }

  return (
    <div className="subscription-section">
      <h3>Subscription</h3>
      
      {error && <div className="error-message">{error}</div>}
      
      <div className="subscription-details">
        <div className="subscription-tier">
          <span className="field-label">Current Plan:</span>
          <span className="field-value highlight">
            {getTierName(subscriptionTier)}
          </span>
        </div>
        
        {subscriptionDetails && (
          <>
            <div className="subscription-status">
              <span className="field-label">Status:</span>
              <span className={`field-value status-${subscriptionDetails.status}`}>
                {subscriptionDetails.status}
              </span>
            </div>
            
            {subscriptionDetails.currentPeriodEnd && (
              <div className="subscription-period">
                <span className="field-label">Current Period Ends:</span>
                <span className="field-value">
                  {formatDate(subscriptionDetails.currentPeriodEnd)}
                </span>
              </div>
            )}
          </>
        )}
        
        <div className="subscription-actions">
          <button 
            className="btn primary-btn" 
            onClick={handleManageSubscription}
            disabled={portalLoading}
          >
            {portalLoading ? 'Loading...' : 'Manage Subscription'}
          </button>
          
          <button 
            className="btn primary-btn upgrade-btn" 
            onClick={handleUpgradeSubscription}
            disabled={checkoutLoading}
          >
            {checkoutLoading ? 'Loading...' : 'Upgrade!'}
          </button>
          
          {/* <button 
            className="btn secondary-btn" 
            onClick={fetchSubscriptionData} 
            disabled={loading}
          >
            Refresh
          </button> */}
        </div>
      </div>
    </div>
  );
}

export default SubscriptionManagement; 