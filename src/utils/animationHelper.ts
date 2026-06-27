/**
 * Animates a cloned product image flying from its source position to the shopping cart icon
 */
export const triggerFlyToCart = (startRect: DOMRect, imageSrc: string) => {
  // Find cart icon target bounding rect
  // Mobile floating cart button has higher priority if visible, otherwise use navbar header cart icon
  let targetElement = document.getElementById('cart-icon-target-float') || document.getElementById('cart-icon-target');
  
  if (!targetElement) {
    // If not found by ID, try checking by class selectors
    targetElement = document.querySelector('.cart-icon-target') || document.querySelector('[aria-label="Open Shopping Cart"]');
  }
  
  if (!targetElement) return;

  const targetRect = targetElement.getBoundingClientRect();

  // Create temporary image element for fly animation
  const flyImg = document.createElement('img');
  flyImg.src = imageSrc;
  flyImg.style.position = 'fixed';
  flyImg.style.left = `${startRect.left}px`;
  flyImg.style.top = `${startRect.top}px`;
  flyImg.style.width = `${startRect.width}px`;
  flyImg.style.height = `${startRect.height}px`;
  flyImg.style.borderRadius = '50%';
  flyImg.style.objectFit = 'cover';
  flyImg.style.zIndex = '99999';
  flyImg.style.pointerEvents = 'none';
  
  // Custom transition animation
  flyImg.style.transition = 'all 0.85s cubic-bezier(0.25, 1, 0.5, 1)';
  flyImg.style.opacity = '1';
  flyImg.style.boxShadow = '0 10px 25px rgba(42, 14, 10, 0.3)';

  document.body.appendChild(flyImg);

  // Trigger animation next frame
  requestAnimationFrame(() => {
    // Calculate central coordinate of target cart icon
    const destLeft = targetRect.left + targetRect.width / 2 - 16;
    const destTop = targetRect.top + targetRect.height / 2 - 16;
    
    flyImg.style.left = `${destLeft}px`;
    flyImg.style.top = `${destTop}px`;
    flyImg.style.width = '32px';
    flyImg.style.height = '32px';
    flyImg.style.opacity = '0.3';
    flyImg.style.transform = 'scale(0.2) rotate(540deg)';
  });

  // Remove element after transition completes
  setTimeout(() => {
    flyImg.remove();
    
    // Add custom trigger class on cart icon for temporary bump effect
    if (targetElement) {
      targetElement.classList.add('cart-bump-active');
      setTimeout(() => {
        targetElement?.classList.remove('cart-bump-active');
      }, 500);
    }
  }, 860);
};
