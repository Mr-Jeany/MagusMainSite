import json

from django.http import HttpResponseNotFound, HttpResponseNotAllowed, HttpResponseRedirect
from django.shortcuts import render, redirect

from magus_utilities.processing_data import LineChart
from magus_utilities.requesters import StratzRequester, OpenDota
from magus_utilities import config
from magus_utilities.utils import convert_qplayer_to_dict


# Create your views here.
def main_player_page(request, player_id):
    context = {
        "player_id": player_id
    }
    return render(request, "player/index.html", context=context)

def charts_page(request, player_id):
    query_values = request.GET.dict()
    print(query_values)

    players_charts = {}
    for key in query_values:
        if key.isdigit():

            players_charts[key] = convert_qplayer_to_dict(query_values[key])




    others = []
    if "others" in query_values:
        others = query_values["others"].split(",")

    if "value" not in query_values:
        return HttpResponseRedirect(f"/player/{player_id}/charts?value=goldPerMinute")

    take = "10" if "take" not in query_values else query_values["take"]

    # stats = LineChart.matches_chart(player_id=player_id, value=query_values["value"], others=others, take=take)

    stats = LineChart.multiple_charts(players_charts, 10)

    context = {
        "player_id": player_id,
        "player_name": OpenDota.get_player_name(player_id),
        "stats": json.dumps(stats),
        "allowed_params": config.ALLOWED_PARAMETRS,
        "allowed_params_json_dumped": json.dumps(config.ALLOWED_PARAMETRS),
        "chosen_param": query_values["value"],
        "chosen_param_name": config.ALLOWED_PARAMETRS[query_values["value"]],
        "already_exists": others
    }
    return render(request, "player/charts.html", context=context)