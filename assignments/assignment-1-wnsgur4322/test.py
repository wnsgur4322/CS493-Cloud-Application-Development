# CS493 - Cloud Application Development
# Assignment 1 - API design and server implementation
# Author: Junhyeok Jeong, jeongju@oregonstate.edu
# github: wnsgur4322

import pycurl
import json
import requests
import random
import sys

localhost = "http://localhost:8080"
business_attrs = ["owner", "name", "address", "city", "state", "zip", "phone", "category", "subcategory"]
user_attrs = ["username", "firstname", "lastname", "owned_businesses"]
review_attrs = ["star_rate", "dollar_rate",  "user", "text"]

def get_url(url, silent=None):
        res = requests.get(url)
        if (not silent):
                print(res.text)
        return res

def post_url(url, payload=None):
        return requests.post(url, json=payload)

def put_url(url, payload=None):
        return requests.put(url, json=payload)

def delete_url(url, payload=None):
        return requests.delete(url, json=payload)

def business_test():
        post_dict = {
                "owner": "fake1",
                "name": "testing",
                "address": "456 test blvd",
                "city": "Portland",
                "state": "Oregon",
                "zip": "97330",
                "phone": "5414444444",
                "category": "restaurant",
                "subcategory": "test"
                }
        put_dict = {
                "owner": "fake1",
                "name": "edit testing",
                "address": "456 edit blvd",
                "city": "Portland",
                "state": "Oregon",
                "zip": "97330",
                "phone": "5414444444",
                "category": "restaurant",
                "subcategory": "edit"
                }
        #get
        print("[TEST] Business GET")
        print(get_url( localhost + "/business", silent=True))  

        #get with business id
        print("[TEST] Business GET with business id")
        print( get_url( localhost + "/business/" + "0", silent=True))

        #post
        print("[TEST] new business post") 
        print(post_url( localhost + "/business" , payload=post_dict))

        #put
        print("[TEST] Business edit")
        print(put_url(localhost+"/business/" + "2", payload=put_dict))
        
        #delete
        print("[TEST] business delete")
        print(delete_url( localhost + "/business/"+ "2")) 

        return

def user_test():
        post_dict = {
                "username": "fake3",
                "firstname": "tester",
                "lastname": "forusertest",
                "owned_businesses": ["test"]
        }
        put_dict = {
                "username": "fake3",
                "firstname": "tester",
                "lastname": "editting test",
                "owned_businesses": []
        }
        #get
        print("[TEST] User GET")
        print(get_url( localhost + "/user", silent=True))  

        #get with username
        print("[TEST] User GET with username")
        print( get_url( localhost + "/user/" + "fake1", silent=True))

        #post
        print("[TEST] new user post") 
        print(post_url( localhost + "/user" , payload=post_dict))

        #put
        print("[TEST] user edit")
        print(put_url(localhost+"/user/" + "fake3", payload=put_dict))
        
        #delete
        print("[TEST] user delete")
        print(delete_url(localhost + "/user/"+ "fake3")) 

        return

def review_test():
        post_dict = {
                "star_rate": 5,
                "dollar_rate": 2,
                "user": "fake1",
                "text": "the crust is awesome!"
        }
        put_dict = {
                "star_rate": 4,
                "dollar_rate": 1,
                "text": "the crust is editted! lol"
        }

        #post
        print("[TEST] new review post at businessID: 0") 
        print(post_url( localhost + "/business/0/reviews" , payload=post_dict))

        #put
        print("[TEST] review edit")
        print(put_url(localhost+"/business/0/reviews/" + "fake1", payload=put_dict))
        
        #delete
        print("[TEST] review delete")
        print(delete_url(localhost + "/business/0/reviews/"+ "fake1")) 

        return

def photo_test():
        post_dict = {
                "photo_url": "https://ichef.bbci.co.uk/news/976/cpsprodpb/12A9B/production/_111434467_gettyimages-1143489763.jpg",
                "caption": "a cat 1",
                "user": "fake1"
        }
        put_dict = {
                "photo_url": "https://ichef.bbci.co.uk/news/976/cpsprodpb/12A9B/production/_111434467_gettyimages-1143489763.jpg",
                "caption": "a editting cat !"
        }

        #post
        print("[TEST] new photo post at businessID: 0") 
        print(post_url( localhost + "/business/0/photos" , payload=post_dict))

        #put
        photo_id = "0"
        print("[TEST] existed photo edit")
        print(put_url(localhost+"/business/0/photos/" + "fake1/" + photo_id, payload=put_dict))
        
        #delete
        print("[TEST] existed photo delete")
        print(delete_url(localhost + "/business/0/photos/"+ "fake1/" + photo_id)) 

        return






if __name__ == "__main__":
        print("------Business Test Start------")
        business_test()
        print("------Business Test End------\n")

        print("------User Test Start------")
        user_test()
        print("------User Test End------\n")

        print("------Review Test Start------")
        review_test()
        print("------Review Test End------\n")

        print("------Photo Test Start------")
        photo_test()
        print("------Photo Test End------\n")