import React, { useState, useEffect } from 'react';
import './AppTour.css';

const AppTour = ({ onComplete }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [isVisible, setIsVisible] = useState(true);

  const tourSteps = [
    {
      title: "Welcome to CardManager! 👋",
      description: "Let's take a quick tour to help you get started with managing your credit cards smartly.",
      target: null,
      position: "center"
    },
    {
      title: "Dashboard 📊",
      description: "Your main hub showing overview of all your cards, expenses, and credit utilization. Quick stats and insights at a glance.",
      target: ".nav-item:nth-child(1)",
      position: "right"
    },
    {
      title: "My Cards 💳",
      description: "Add and manage all your credit cards here. View card details, benefits, offers, and track your spending limits.",
      target: ".nav-item:nth-child(2)",
      position: "right"
    },
    {
      title: "Expenses 💰",
      description: "Track every purchase you make. Select which card you used and see your rewards automatically calculated.",
      target: ".nav-item:nth-child(3)",
      position: "right"
    },
    {
      title: "Recommendations 🎯",
      description: "Planning a purchase? Get AI-powered suggestions on which card will give you the maximum rewards or cashback.",
      target: ".nav-item:nth-child(4)",
      position: "right"
    },
    {
      title: "Reviews ⭐",
      description: "Read and write reviews for credit cards. Share your experiences and learn from the community.",
      target: ".nav-item:nth-child(5)",
      position: "right"
    },
    {
      title: "Credit Score Widget 📈",
      description: "Your current credit score is displayed here. Maintaining good credit utilization helps improve your score.",
      target: ".credit-score-widget",
      position: "top"
    },
    {
      title: "Ready to Start! 🚀",
      description: "You're all set! Start by adding your first credit card. Click the '+' button to get started.",
      target: null,
      position: "center"
    }
  ];

  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') {
        handleSkip();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, []);

  const handleNext = () => {
    if (currentStep < tourSteps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleComplete();
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSkip = () => {
    setIsVisible(false);
    setTimeout(() => {
      onComplete();
    }, 300);
  };

  const handleComplete = () => {
    setIsVisible(false);
    setTimeout(() => {
      onComplete();
    }, 300);
  };

  const getTargetPosition = () => {
    const step = tourSteps[currentStep];
    if (!step.target) return null;

    const element = document.querySelector(step.target);
    if (!element) return null;

    const rect = element.getBoundingClientRect();
    return {
      top: rect.top,
      left: rect.left,
      width: rect.width,
      height: rect.height
    };
  };

  const getTooltipPosition = () => {
    const step = tourSteps[currentStep];
    if (step.position === "center") {
      return {
        top: "50%",
        left: "50%",
        transform: "translate(-50%, -50%)"
      };
    }

    const targetPos = getTargetPosition();
    if (!targetPos) return {};

    const tooltipWidth = 420; // max-width from CSS
    const tooltipHeight = 350; // estimated height
    const margin = 20;
    const viewportPadding = 20;

    let position = {};

    switch (step.position) {
      case "right":
        let leftPos = targetPos.left + targetPos.width + margin;
        let topPos = targetPos.top + targetPos.height / 2;

        // Check if tooltip goes off right edge
        if (leftPos + tooltipWidth > window.innerWidth - viewportPadding) {
          leftPos = targetPos.left - tooltipWidth - margin;
        }

        // Check if tooltip goes off bottom
        if (topPos + tooltipHeight / 2 > window.innerHeight - viewportPadding) {
          topPos = window.innerHeight - tooltipHeight / 2 - viewportPadding;
        }

        // Check if tooltip goes off top
        if (topPos - tooltipHeight / 2 < viewportPadding) {
          topPos = tooltipHeight / 2 + viewportPadding;
        }

        position = {
          top: `${topPos}px`,
          left: `${leftPos}px`,
          transform: "translateY(-50%)"
        };
        break;

      case "left":
        position = {
          top: `${targetPos.top + targetPos.height / 2}px`,
          right: `${window.innerWidth - targetPos.left + margin}px`,
          transform: "translateY(-50%)"
        };
        break;

      case "top":
        let bottomPos = window.innerHeight - targetPos.top + margin;
        let centerX = targetPos.left + targetPos.width / 2;

        // Ensure tooltip doesn't go off left or right edge
        if (centerX - tooltipWidth / 2 < viewportPadding) {
          centerX = tooltipWidth / 2 + viewportPadding;
        }
        if (centerX + tooltipWidth / 2 > window.innerWidth - viewportPadding) {
          centerX = window.innerWidth - tooltipWidth / 2 - viewportPadding;
        }

        position = {
          bottom: `${bottomPos}px`,
          left: `${centerX}px`,
          transform: "translateX(-50%)"
        };
        break;

      case "bottom":
        position = {
          top: `${targetPos.top + targetPos.height + margin}px`,
          left: `${targetPos.left + targetPos.width / 2}px`,
          transform: "translateX(-50%)"
        };
        break;

      default:
        return {};
    }

    return position;
  };

  if (!isVisible) return null;

  const step = tourSteps[currentStep];
  const targetPos = getTargetPosition();

  return (
    <div className="app-tour">
      <div className="tour-overlay" onClick={handleSkip} />

      {targetPos && (
        <div
          className="tour-spotlight"
          style={{
            top: targetPos.top - 8,
            left: targetPos.left - 8,
            width: targetPos.width + 16,
            height: targetPos.height + 16
          }}
        />
      )}

      <div className="tour-tooltip" style={getTooltipPosition()}>
        <button className="tour-skip" onClick={handleSkip}>
          Skip Tour
        </button>

        <div className="tour-content">
          <h3 className="tour-title">{step.title}</h3>
          <p className="tour-description">{step.description}</p>
        </div>

        <div className="tour-progress">
          <div className="tour-dots">
            {tourSteps.map((_, index) => (
              <span
                key={index}
                className={`tour-dot ${index === currentStep ? 'active' : ''} ${index < currentStep ? 'completed' : ''}`}
              />
            ))}
          </div>
          <span className="tour-step-count">
            {currentStep + 1} / {tourSteps.length}
          </span>
        </div>

        <div className="tour-actions">
          <button
            className="tour-btn tour-btn-secondary"
            onClick={handlePrevious}
            disabled={currentStep === 0}
          >
            Previous
          </button>
          <button
            className="tour-btn tour-btn-primary"
            onClick={handleNext}
          >
            {currentStep === tourSteps.length - 1 ? "Get Started" : "Next"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AppTour;
