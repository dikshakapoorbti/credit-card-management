import { useState } from 'react';
import AddCardModal from './AddCardModal';
import './Onboarding.css';

const Onboarding = ({ onComplete }) => {
  const [step, setStep] = useState(1);
  const [showAddCard, setShowAddCard] = useState(false);
  const [addedCards, setAddedCards] = useState([]);

  const handleUseDemoData = () => {
    onComplete('demo');
  };

  const handleStartFresh = () => {
    setStep(2);
  };

  const handleCardAdded = () => {
    setAddedCards([...addedCards, { id: Date.now() }]);
    setShowAddCard(false);
  };

  const handleSkipAndContinue = () => {
    onComplete('fresh', addedCards);
  };

  const handleAddAnotherCard = () => {
    setShowAddCard(true);
  };

  return (
    <div className="onboarding-container">
      <div className="onboarding-background">
        <div className="gradient-orb orb-1"></div>
        <div className="gradient-orb orb-2"></div>
        <div className="gradient-orb orb-3"></div>
      </div>

      <div className="onboarding-content">
        {step === 1 && (
          <div className="onboarding-step">
            <div className="welcome-header">
              <div className="welcome-icon">💳</div>
              <h1>Welcome to CardManager!</h1>
              <p>Your smart credit card management assistant</p>
            </div>

            <div className="onboarding-options">
              <div className="option-card" onClick={handleUseDemoData}>
                <div className="option-icon">🎯</div>
                <h3>Try Demo Data</h3>
                <p>Explore the app with pre-loaded credit cards and transactions</p>
                <ul className="option-features">
                  <li>✓ 4 sample credit cards</li>
                  <li>✓ 8 sample transactions</li>
                  <li>✓ Ready-to-use analytics</li>
                  <li>✓ Perfect for testing</li>
                </ul>
                <button className="btn-primary">Start with Demo</button>
              </div>

              <div className="option-card" onClick={handleStartFresh}>
                <div className="option-icon">🚀</div>
                <h3>Start Fresh</h3>
                <p>Add your own credit cards and begin tracking expenses</p>
                <ul className="option-features">
                  <li>✓ Add your real cards</li>
                  <li>✓ Custom card details</li>
                  <li>✓ Track actual expenses</li>
                  <li>✓ Personalized insights</li>
                </ul>
                <button className="btn-secondary">Add My Cards</button>
              </div>
            </div>

            <div className="onboarding-footer">
              <p>You can always switch or add more cards later</p>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="onboarding-step">
            <div className="setup-header">
              <h2>Add Your Credit Cards</h2>
              <p>Let's set up your cards to get started</p>
            </div>

            {addedCards.length === 0 ? (
              <div className="empty-cards">
                <div className="empty-icon">💳</div>
                <h3>No cards added yet</h3>
                <p>Add your first credit card to begin tracking expenses and maximizing rewards</p>
                <button
                  className="btn-primary btn-large"
                  onClick={() => setShowAddCard(true)}
                >
                  + Add Your First Card
                </button>
              </div>
            ) : (
              <div className="added-cards-section">
                <div className="cards-summary">
                  <div className="summary-icon">✅</div>
                  <div>
                    <h3>{addedCards.length} Card{addedCards.length > 1 ? 's' : ''} Added</h3>
                    <p>Great start! You can add more cards anytime</p>
                  </div>
                </div>

                <div className="setup-actions">
                  <button
                    className="btn-secondary"
                    onClick={handleAddAnotherCard}
                  >
                    + Add Another Card
                  </button>
                  <button
                    className="btn-primary btn-large"
                    onClick={handleSkipAndContinue}
                  >
                    Continue to Dashboard
                  </button>
                </div>
              </div>
            )}

            <div className="setup-footer">
              <button
                className="btn-link"
                onClick={handleUseDemoData}
              >
                Or use demo data instead
              </button>
            </div>
          </div>
        )}
      </div>

      {showAddCard && (
        <AddCardModal
          onClose={() => {
            setShowAddCard(false);
            handleCardAdded();
          }}
        />
      )}
    </div>
  );
};

export default Onboarding;
