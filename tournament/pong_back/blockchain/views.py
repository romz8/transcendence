# blockchain/views.py
from django.shortcuts import render
from django.http import HttpResponse
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from rest_framework.decorators import api_view
from .eth import rpc_url, web3, contract, account_address, private_key

import logging

logger = logging.getLogger(__name__)

@csrf_exempt
def set_tournament(request):
    try:
        winner = request.data.get('winner')
        runner_up = request.data.get('runner_up')
        final_score = request.data.get('final_score')
        participant_count = request.data.get('participant_count')


        nonce = web3.eth.get_transaction_count(account_address)
        latest_block = web3.eth.get_block("latest")
        base_fee_per_gas = latest_block.baseFeePerGas   # Base fee in the latest block (in wei)
        max_priority_fee_per_gas = web3.to_wei(1, 'gwei') # Priority fee to include the transaction in the block
        max_fee_per_gas = (5 * base_fee_per_gas) + max_priority_fee_per_gas # Maximum amount you’re willing to pay

        logger.info('---------------------------------------')
        logger.info(nonce)
        logger.info(max_fee_per_gas)
        logger.info(max_priority_fee_per_gas)
        logger.info('---------------------------------------')

        unsent_tx = contract.functions.set(winner, runner_up, final_score, participant_count).build_transaction({
            'chainId': 11155111,
            'maxFeePerGas': max_fee_per_gas,
            'maxPriorityFeePerGas': max_priority_fee_per_gas,
            'nonce': nonce,
        })

        signed_tx = web3.eth.account.sign_transaction(unsent_tx, private_key)
        tx_hash = web3.eth.send_raw_transaction(signed_tx.raw_transaction)
        tx_receipt = web3.eth.wait_for_transaction_receipt(tx_hash)
        
        return JsonResponse({'tx': tx_receipt}, status=200)

    except Exception as e:
        return JsonResponse({'error': str(e)}, status=404)

@api_view(['GET'])
def get_tournament(request):
    try:
        results = contract.functions.get().call()
                # Convert the list of results into a more usable format
        response = [
            {
                'winner': result[0],
                'runner_up': result[1],
                'final_score': result[2],
                'participant_count': result[3]
            }
            for result in results  # Iterate over the list of TournamentResult structures
        ]
        return JsonResponse({"tournaments": response})  # Return the list of results
    
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=404)