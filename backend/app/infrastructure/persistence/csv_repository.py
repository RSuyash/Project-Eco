import pandas as pd
import logging
from typing import Any, Optional
from app.domain.repositories import VegetationRepository
from app.core.config import (
    CLEANED_VEG_FULL_PATH,
    ECO_RESULTS_PATH,
    CANOPY_RESULTS_PATH,
)

logger = logging.getLogger(__name__)

class CsvVegetationRepository(VegetationRepository):
    def get_cleaned_data(self) -> Optional[pd.DataFrame]:
        try:
            return pd.read_csv(CLEANED_VEG_FULL_PATH)
        except FileNotFoundError:
            logger.error(f"Data file not found: {CLEANED_VEG_FULL_PATH}")
            return None

    def get_ecological_results(self) -> Optional[pd.DataFrame]:
        try:
            return pd.read_csv(ECO_RESULTS_PATH)
        except FileNotFoundError:
            logger.error(f"Data file not found: {ECO_RESULTS_PATH}")
            return None

    def get_canopy_results(self) -> Optional[pd.DataFrame]:
        try:
            return pd.read_csv(CANOPY_RESULTS_PATH)
        except FileNotFoundError:
            logger.error(f"Data file not found: {CANOPY_RESULTS_PATH}")
            return None
