from magus_utilities.requesters import StratzRequester, OpenDota


class LineChart:
    @staticmethod
    def matches_chart(**kwargs):
        if "player_id" not in kwargs or "value" not in kwargs:
            raise Exception("Function \"create_chart_for\" needs \"player_id\" and \"value\" as arguments.")

        else:
            # Preparing and getting info
            sr = StratzRequester()
            player_id = kwargs["player_id"]
            take = 10 if "take" not in kwargs else kwargs["take"]
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

lc = LineChart()

lc.matches_chart(player_id=1548070952, value="goldPerMinute", others=[1169122215, 1276948601, 1246579239])