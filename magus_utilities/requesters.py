import requests

from magus_utilities.config import BEARER
# Removing the circular import
# from magus_utilities.processing_data import MatchStats
from magus_utilities.utils import placeholders, multiplaceholder

class StratzRequester:
    def __init__(self):
        self.headers = {
            "Authorization": BEARER,
            "User-Agent": "STRATZ_API",
            "Content-Type": "application/json"
        }

        r = '''
        {
            constants {
                items {
                    id
                    shortName
                }
            }
        }
        '''
        items = self.get_data_from_request(r)
        self.filtered_items = {}
        for item in items["constants"]["items"]:
            self.filtered_items[item["id"]] = {
                "shortName": item["shortName"]
            }

    def get_data_from_request(self, r):
        result = requests.post("https://api.stratz.com/graphql", headers=self.headers, json={"query": r}).json()

        try:
            data = result["data"]
        except:
            print(result)
            return

        return data

    def last_matches(self, player_id: int, *params, number_of_matches: int=10, skip_matches: int=0):
        """
        Returns list of last matches of player
        :param player_id: ID of a player to return matches
        :param number_of_matches: Number of last_matches to return
        :param params: What values of match to return
        :param skip_matches: Number of matches to skip
        :return: List with all matches
        """
        req = '''
        {
            player (steamAccountId: %player_id)
            {
                matches (request: {take: %number_of_matches, skip: %skip_matches})
                {
                    %%params
                }
            }
        }
        '''

        req = placeholders(req, "%", player_id=player_id, number_of_matches=number_of_matches, skip_matches=skip_matches)
        req = multiplaceholder(req, "params", params)

        data = self.get_data_from_request(req)

        return data["player"]["matches"]

    def last_matches_heroes_filter(self, player_id: int, heroes_filter, *params, number_of_matches: int=10, skip_matches: int=0):
        """
        Returns list of last matches of player
        :param heroes_filter: ID of heroes to filter by
        :param player_id: ID of a player to return matches
        :param number_of_matches: Number of last_matches to return
        :param params: What values of match to return
        :param skip_matches: Number of matches to skip
        :return: List with all matches
        """
        req = '''
        {
            player (steamAccountId: %player_id)
            {
                matches (request: {take: %number_of_matches, skip: %skip_matches, heroIds: [%ids]})
                {
                    %%params
                }
            }
        }
        '''

        req = placeholders(req, "%", player_id=player_id, number_of_matches=number_of_matches, skip_matches=skip_matches, ids=",".join(heroes_filter))
        req = multiplaceholder(req, "params", params)

        data = self.get_data_from_request(req)


        print(data)
        return data["player"]["matches"]

    def get_match(self, match_id):
        req = '''
           {
               match (id: %match_id) {
                   didRadiantWin
                   players {
                       steamAccount {
                           name
                       }
                       isRadiant
                       hero {
                           shortName
                       }
                       kills
                       deaths
                       assists
                       networth
                       position
                       item0Id
                       item1Id
                       item2Id
                       item3Id
                       item4Id
                       item5Id
                   }
               }
           }
           '''

        req = placeholders(req, "%", match_id=match_id)

        data = self.get_data_from_request(req)
        return data

class OpenDota:
    @staticmethod
    def get_player_name(player_id):
        name = requests.get(f"https://api.opendota.com/api/players/{player_id}").json()["profile"]["personaname"]
        return name
