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

if __name__ == "__main__":
    print("Web3 connection status:", check_web3_connection())
