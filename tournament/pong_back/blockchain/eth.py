from web3 import Web3
from django.conf import settings
import json
import logging

logger = logging.getLogger(__name__)

# Initialize Web3 
rpc_url = "https://ethereum-sepolia-rpc.publicnode.com"
web3 = Web3(Web3.HTTPProvider(rpc_url))

# Contract details
contract_address = settings.CONTRACT_ADDRESS  # Replace with your contract address
abi_file_path = settings.PATH_TO_ABI  # Path to ABI JSON file
private_key = settings.PRIVATE_KEY
account_address = settings.OWNER_ADDRESS

#Load contract ABI
with open(abi_file_path, 'r') as abi_file:
    contract_abi = json.load(abi_file)

contract = web3.eth.contract(address=contract_address, abi=contract_abi)

def set_tournament_result(winner, runner_up, final_score, participant_count):
    try:

        nonce = web3.eth.get_transaction_count(account_address)
        latest_block = web3.eth.get_block("latest")
        base_fee_per_gas = latest_block.baseFeePerGas   # Base fee in the latest block (in wei)
        max_priority_fee_per_gas = web3.to_wei(1, 'gwei') # Priority fee to include the transaction in the block
        max_fee_per_gas = (5 * base_fee_per_gas) + max_priority_fee_per_gas # Maximum amount you’re willing to pay

        logger.info('---------------------------------------')
        logger.info(nonce)
        logger.info(max_fee_per_gas)
        logger.info(max_priority_fee_per_gas)


        unsent_tx = contract.functions.set(winner, runner_up, final_score, participant_count).build_transaction({
            'chainId': 11155111,
            'maxFeePerGas': max_fee_per_gas,
            'maxPriorityFeePerGas': max_priority_fee_per_gas,
            'nonce': nonce,
        })
        logger.info(unsent_tx)
        signed_tx = web3.eth.account.sign_transaction(unsent_tx, private_key)
        logger.info('transaction signed')
        logger.info('---------------------------------------')

        tx_hash = web3.eth.send_raw_transaction(signed_tx.raw_transaction)
        tx_receipt = web3.eth.wait_for_transaction_receipt(tx_hash)
        
        return tx_receipt

    except Exception as e:
        return {'error': str(e)}

def get_tournament_results():
    try:
        results = contract.functions.get().call()
                # Convert the list of results into a more usable format
        tournament_results = [
            {
                'winner': result[0],
                'runner_up': result[1],
                'final_score': result[2],
                'participant_count': result[3]
            }
            for result in results  # Iterate over the list of TournamentResult structures
        ]
        return tournament_results  # Return the list of results
    
    except Exception as e:
        return {'error': str(e)}

if __name__ == "__main__":
    print("Web3 connection status:", check_web3_connection())
