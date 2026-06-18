import logging

logger = logging.getLogger("CreditManager")

class CreditManager:
    """
    Manages the simulated credit economy of Lessie AI.
    Features a Sandbox Mode to bypass cost checks for development.
    """
    def __init__(self, balance: int = 1000, sandbox_mode: bool = False):
        self.balance = balance
        self.sandbox_mode = sandbox_mode
        if self.sandbox_mode:
            logger.info("CreditManager initialized in SANDBOX MODE (Credits are infinite).")

    def has_sufficient_credits(self, cost: int) -> bool:
        if self.sandbox_mode:
            return True
        return self.balance >= cost

    def consume(self, cost: int, description: str = "operation"):
        if self.sandbox_mode:
            logger.info(f"[SANDBOX] Bypassed consumption of {cost} credits for {description}.")
            return True

        if self.balance >= cost:
            self.balance -= cost
            logger.info(f"Consumed {cost} credits for {description}. New balance: {self.balance}")
            return True
        
        logger.error(f"Insufficient credits for {description}. Required: {cost}, Available: {self.balance}")
        return False

    def add_credits(self, amount: int):
        self.balance += amount
        logger.info(f"Added {amount} credits. New balance: {self.balance}")
