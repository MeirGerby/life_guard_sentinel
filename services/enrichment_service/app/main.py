from shared.utils.logger import get_logger

logger = get_logger(__name__)


def run():
    logger.info("Enrichment service running...")


if __name__ == "__main__":
    run()