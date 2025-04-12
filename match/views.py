from django.http import HttpResponse
from django.shortcuts import render

from magus_utilities.processing_data import MatchStats


# Create your views here.
def main_match_page(request, match_id):
    player_stats = MatchStats.process_match(match_id)

    context = {
        "match_id": match_id,
        "player_stats": player_stats
    }
    return render(request, template_name="match/index.html", context=context)