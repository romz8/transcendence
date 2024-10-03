# blockchain/views.py
from django.shortcuts import render
from django.http import HttpResponse
from .eth import set_tournament_result, get_tournament_results
from django.views.decorators.csrf import csrf_exempt
import logging

# View for the landing page and form submission
@csrf_exempt
def tournament_landing_page(request):
    if request.method == 'POST':
        # Handle the form submission (POST request)
        winner = request.POST.get('winner')
        runner_up = request.POST.get('runner_up')
        final_score = request.POST.get('final_score')
        participant_count = request.POST.get('participant_count')

        try:
            # Call the set_tournament_result function to interact with the contract
            tx_receipt = set_tournament_result(winner, runner_up, final_score, int(participant_count))

            if 'error' in tx_receipt:
                logging.error(f"Error setting result: {tx_receipt['error']}")
                return render(request, 'landing_page.html', {
                    'error': tx_receipt['error']
                })

            # If success, render the form with a success message
            return render(request, 'landing_page.html', {
                'success': f"Transaction successful with hash: {tx_receipt.transactionHash.hex()}"
            })

        except Exception as e:
            logging.error(f"Exception occurred: {str(e)}")
            return render(request, 'landing_page.html', {
                'error': str(e)
            })

    elif request.method == 'GET' and 'check_results' in request.GET:
        try:
            # Get tournament results from the contract
            tournament_results = get_tournament_results()
            return render(request, 'landing_page.html', {'results': tournament_results})
        except Exception as e:
            logging.error(f"Error fetching results: {str(e)}")
            return render(request, 'landing_page.html', {
                'error': str(e)
            })
        
    # Handle GET request, just render the form
    return render(request, 'landing_page.html')