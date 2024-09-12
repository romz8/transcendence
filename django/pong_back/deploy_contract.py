from web3 import Web3
import os
from solcx import compile_source
from dotenv import load_dotenv
import json
import logging

load_dotenv()

#set pre-funded account and private key
account_address = os.getenv.OWNER_ADDRESS
private_key = os.getenv.PRIVATE_KEY

# nonce and blockchain gas variables
nonce = web3.eth.get_transaction_count(account_address)
latest_block = web3.eth.get_block("latest")
base_fee_per_gas = latest_block.baseFeePerGas   # Base fee in the latest block (in wei)
max_priority_fee_per_gas = web3.to_wei(1, 'gwei') # Priority fee to include the transaction in the block
max_fee_per_gas = (5 * base_fee_per_gas) + max_priority_fee_per_gas # Maximum amount you’re willing to pay

# compile and deploy smart contract
compiled_sol  = compile_source(
    '''
    // SPDX-License-Identifier: MIT

    pragma solidity ^0.8.10;

    contract TournamentContract {
        struct TournamentResult {
            string winner;
            string runnerUp;
            string finalScore;
            uint256 participantCount;
        }

        TournamentResult[] public  results;

        function set(string memory _winner, string memory _runnerUp, string memory _finalScore, uint256 _participantCount) public {
            results.push(TournamentResult(_winner, _runnerUp, _finalScore, _participantCount));
        }

        function get() public view returns (TournamentResult[] memory) {
            return results;
        }
    }
    ''',
    output_values=['abi', 'bin']
    )

contract_interface = compiled_sol.popitem()

# get bytecode and abi
bytecode = contract_interface['bin']
abi = contract_interface['abi']

#instantiate contract
Tournament = web3.eth.contract(abi=abi, bytecode=bytecode)

# Submit the transaction that deploys the contract
unsent_tex = Tournament.constructor().build_transaction({
    'chainId': 11155111,
    'from': account_address,
    'nonce': nonce,
    'maxFeePerGas': max_fee_per_gas,
    'maxPriorityFeePerGas': max_priority_fee_per_gas,
})

signed_tx = web3.eth.account.sign_transaction(unsent_tex, private_key)
tx_hash = web3.eth.send_raw_transaction(signed_tx.rawTransaction)
tx_receipt = web3.eth.wait_for_transaction_receipt(tx_hash)

# Write to .env file
with open('.env', 'a') as f:
    f.write(f'CONTRACT_ADDRESS={tx_receipt.contractAddress}\n')
    f.write(f'ABI={abi}\n')
    f.write(f'WEB3={web3}\n')