export const filterAllowedCards = (cards, allowedPages, isAdmin) => {
    // Admin sees all cards
    if (isAdmin === 1 || isAdmin === true) return cards;
    
    if (!allowedPages || !Array.isArray(allowedPages)) return [];
    
    // Determine which actions are allowed based on the user's role/pages
    const allowedActions = new Set(
        allowedPages
            // Usually, isdefault is a boolean or 1/0
            .filter(page => page.isdefault === 1 || page.isdefault === true)
            .map(page => page.link)
    );
    
    // Filter the home cards
    return cards.filter(card => allowedActions.has(card.action));
};
