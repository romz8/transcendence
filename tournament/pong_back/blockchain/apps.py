from django.apps import AppConfig
from web3 import Web3
from .eth import set_tournament_result, get_tournament_results
import logging
from django.conf import settings
import os
import json

class BlockchainConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'blockchain'      

    #def check_web3_connection(self):
     #   is_connected = check_web3_connection()
      #  if is_connected:
       #     logging.info("Web3 connected successfully.")
        #else:
         #   logging.error("Failed to connect to Web3.")

    def set_tournament_result(self, winner, runner_up, final_score, participant_count):
        try:
            tx_receipt = set_tournament_result(winner, runner_up, final_score, participant_count)
            if 'error' in tx_receipt:
                logging.error(f"Error setting result: {tx_receipt['error']}")
            else:
                logging.info(f"Successfully set result: {tx_receipt}")
        except Exception as e:
            logging.error(f"Exception occurred while setting result: {str(e)}")

    def get_tournament_results(self):
        try:
            results = get_tournament_results()
            if 'error' in results:
                logging.error(f"Error fetching results: {results['error']}")
            else:
                logging.info(f"Fetched tournament results: {results}")
        except Exception as e:
            logging.error(f"Exception occurred while fetching results: {str(e)}")
