import { useState, useEffect } from 'react';
import './FirstTimeUserGuide.css';

const FirstTimeUserGuide = ({ onComplete }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [isVisible, setIsVisible] = useState(true);

  const steps = [
    {
      title: "Welcome to CardManager! 🎉",
      description: "Let's take a quick tour to help you get started with managing your credit cards smartly.",
      icon: "👋",
      action: "Start Tour",
      position: "center"
    },
    {
      title: "Add Your First Card",
      description: "Click on 'My Cards' in the sidebar, then 'Add New Card' to add your credit card details. We'll help you track spending and maximize rewards!",
      icon: "💳",
      highlight: "cards",
      action: "Next",
      position: "left"
    },
    {
      title: "Track Your Expenses",
      description: "Go to 'Expenses' to log your spending. We'll automatically recommend the best card to use for each purchase based on rewards and benefits!",
      icon: "💰",
      highlight: "expenses",
      action: "Next",
      position: "left"
    },
    {
      title: "Smart Recommendations",
      description: "Our AI analyzes your cards and spending patterns to suggest which card gives you maximum rewards for each category of spending.",
      icon: "🎯",
      highlight: "dashboard",
      action: "Next",
      position: "top"
    },
    {
      title: "You're All Set!",
      description: "Start by adding your first credit card or try our demo data to explore all features. You can always access this tour from the help menu.",
      icon: "🚀",
      action: "Get Started",
      position: "center"
    }
  ];

  useEffect(() => {
    // Mark that user has seen the guide
    const hasSeenGuide = localStorage.getItem('hasSeenGuide');
    if (hasSeenGuide) {
      setIsVisible(false);
    }
  }, []);

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleComplete();
    }
  };

  const handleSkip = () => {
    handleComplete();
  };

  const handleComplete = () => {
    localStorage.setItem('hasSeenGuide', 'true');
    setIsVisible(false);
    if (onComplete) {
      onComplete();
    }
  };

  if (!isVisible) return null;

  const step = steps[currentStep];

  return (
    <>
      <div className="guide-overlay" onClick={handleSkip}></div>
      <div className={`guide-container guide-position-${step.position}`}>
        <button className="guide-close" onClick={handleSkip}>✕</button>

        <div className="guide-content">
          <div className="guide-icon">{step.icon}</div>
          <h2 className="guide-title">{step.title}</h2>
          <p className="guide-description">{step.description}</p>

          <div className="guide-progress">
            {steps.map((_, index) => (
              <div
                key={index}
                className={`progress-dot ${index === currentStep ? 'active' : ''} ${index < currentStep ? 'completed' : ''}`}
              />
            ))}
          </div>

          <div className="guide-actions">
            {currentStep > 0 && (
              <button className="btn-secondary" onClick={() => setCurrentStep(currentStep - 1)}>
                Back
              </button>
            )}
            <button className="btn-primary" onClick={handleNext}>
              {step.action}
            </button>
          </div>

          {currentStep === 0 && (
            <button className="btn-skip" onClick={handleSkip}>
              Skip Tour
            </button>
          )}
        </div>
      </div>
    </>
  );
};

export default FirstTimeUserGuide;
