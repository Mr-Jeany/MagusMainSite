from magus_utilities.requesters import StratzRequester, OpenDota
from magus_utilities.utils import optimise_name


class LineChart:
    @staticmethod
    def matches_chart(**kwargs):
        if "player_id" not in kwargs or "value" not in kwargs:
            raise Exception("Function \"matches_chart\" needs \"player_id\" and \"value\" as arguments.")

        else:
            # Preparing and getting info
            sr = StratzRequester()
            player_id = kwargs["player_id"]
            take = 10 if "take" not in kwargs else kwargs["take"]
            if "heroes" in kwargs:
                matches = sr.last_matches_heroes_filter(player_id,
                                          kwargs["heroes"], {f"players (steamAccountId: {player_id})": [kwargs["value"]]},
                                          number_of_matches=take)
            else:
                matches = sr.last_matches(player_id,
                                      {f"players (steamAccountId: {player_id})": [kwargs["value"]]},
                                      number_of_matches=take)

            # Creating dictionary with main player
            players_stats = {OpenDota.get_player_name(player_id): [str(match["players"][0][kwargs["value"]]) for match in matches]}

            # Adding other players if they are requested
            if "others" in kwargs and len(kwargs["others"]):
                for player_id in kwargs["others"]:
                    matches = sr.last_matches(player_id,
                                              {f"players (steamAccountId: {player_id})": [kwargs["value"]]},
                                              number_of_matches=take)
                    players_stats[OpenDota.get_player_name(player_id)] = [str(match["players"][0][kwargs["value"]]) for match in matches]

            return players_stats

    @staticmethod
    def multiple_charts(player_values, take):
        players_stats = {}
        sr = StratzRequester()
        print(player_values)
        for player_id, player_info in player_values.items():
            print(player_info["heroes"])
            if player_info["heroes"] and "heroes" in player_info:
                matches = sr.last_matches_heroes_filter(player_id, player_info["heroes"],
                                      {f"players (steamAccountId: {player_id})": [player_info["value"]]},
                                      number_of_matches=take)

            else:
                matches = sr.last_matches(player_id,
                                      {f"players (steamAccountId: {player_id})": [player_info["value"]]},
                                      number_of_matches=take)

                print(matches)
            players_stats[OpenDota.get_player_name(player_id)] = [str(match["players"][0][player_info["value"]]) for match in
                                                                  matches]


        return players_stats

class MatchStats:
    result_dictionary = {
        "radiant": {
            "POSITION_1": {
                "name": "jeany",
                "hero": "Spectre",
                "heroIcon": "URL",
                "kills": 10,
                "deaths": 15,
                "assists": 3,
                "networth": 12345
            }
        }
    }
    @staticmethod
    def process_match(match_id):
        sr = StratzRequester()
        match_info = sr.get_match(8230211378)["match"]
        players = {"radiant": {}, "dire": {}}

        for player in match_info["players"]:
            side = "radiant" if player["isRadiant"] else "dire"
            players[side][player["position"]] = {
                "name": optimise_name(player["steamAccount"]["name"]),
                "hero": player["hero"]["shortName"],
                "heroIcon": f"https://courier.spectral.gg/images/dota/portraits/{player['hero']['shortName']}",
                "kills": player["kills"],
                "deaths": player["deaths"],
                "assists": player["assists"],
                "networth": player["networth"],
                "itemsIcons": {
                    "item0": f"https://courier.spectral.gg/images/dota/items/{sr.filtered_items.get(player['item0Id'], {}).get('shortName', '')}",
                    "item1": f"https://courier.spectral.gg/images/dota/items/{sr.filtered_items.get(player['item1Id'], {}).get('shortName', '')}",
                    "item2": f"https://courier.spectral.gg/images/dota/items/{sr.filtered_items.get(player['item2Id'], {}).get('shortName', '')}",
                    "item3": f"https://courier.spectral.gg/images/dota/items/{sr.filtered_items.get(player['item3Id'], {}).get('shortName', '')}",
                    "item4": f"https://courier.spectral.gg/images/dota/items/{sr.filtered_items.get(player['item4Id'], {}).get('shortName', '')}",
                    "item5": f"https://courier.spectral.gg/images/dota/items/{sr.filtered_items.get(player['item5Id'], {}).get('shortName', '')}"
                }
            }

        for side in ["radiant", "dire"]:
            players[side] = dict(sorted(players[side].items(), 
                                       key=lambda item: int(item[0].split('_')[1])))
        
        return players