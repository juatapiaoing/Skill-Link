-- Add max_portfolio_items to PLAN table
ALTER TABLE plan 
ADD COLUMN IF NOT EXISTS max_portfolio_items INT DEFAULT 1;

-- Update existing plans with limits
UPDATE plan SET max_portfolio_items = 1 WHERE nombre = 'Free';
UPDATE plan SET max_portfolio_items = 3 WHERE nombre = 'Plata';
UPDATE plan SET max_portfolio_items = 5 WHERE nombre = 'Oro';
UPDATE plan SET max_portfolio_items = 10 WHERE nombre = 'Platino';
UPDATE plan SET max_portfolio_items = -1 WHERE nombre = 'Black';
