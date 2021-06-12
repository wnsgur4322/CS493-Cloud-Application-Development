# CS493 - Cloud Application Development
# Assignment 2 - Use a database to power your API
# Author: Junhyeok Jeong, jeongju@oregonstate.edu
# github: wnsgur4322

import pycurl
import json
import requests
import random
import sys

localhost = "http://localhost:8080"
businessSchema = ["ownerid","name","address","city","state","zip","phone","category","subcategory","website","email"]
reviewSchema = ["userid","businessid","dollars","stars","review"]
photoSchema = ["userid","businessid","caption"]

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
                "ownerid": 1,
                "name": "testing",
                "address": "456 test blvd",
                "city": "Portland",
                "state": "OR",
                "zip": "97330",
                "phone": "5414444444",
                "category": "restaurant",
                "subcategory": "test",
                "website": "www.google.com"
                }
        put_dict = {
                "ownerid": 1,
                "name": "edit testing",
                "address": "456 edit blvd",
                "city": "Corvallis",
                "state": "OR",
                "zip": "97330",
                "phone": "5414444444",
                "category": "restaurant",
                "subcategory": "edit",
                "website": "www.edit.com"
                }
        #get
        print("[TEST] Business GET")
        print(get_url( localhost + "/businesses", silent=True))  

        #get with business id
        print("[TEST] Business GET with business id")
        print( get_url( localhost + "/businesses/" + "0", silent=True))

        #post
        print("[TEST] New business post") 
        print(post_url( localhost + "/businesses" , payload=post_dict))

        #put
        print("[TEST] Business edit")
        print(put_url(localhost+"/businesses/" + "19", payload=put_dict))
        
        #delete
        print("[TEST] Business delete")
        print(delete_url( localhost + "/businesses/"+ "19")) 

        return

def user_test():
        #get
        print("[TEST] User Business GET with userid")
        print(get_url( localhost + "/users/6/businesses", silent=True))  

        #get user's business with userid
        print("[TEST] User Review GET with userid")
        print( get_url( localhost + "/users/6/reviews", silent=True))

        #get user's photos with userid
        print("[TEST] User Photo GET with userid")
        print( get_url( localhost + "/users/6/photos", silent=True))

        return

def review_test():
        post_dict = {
                "userid": 1,
                "businessid": 1,
                "dollars": 3,
                "stars": 3,
                "review": "review POST testing"
        }
        put_dict = {
                "userid": 1,
                "businessid": 1,
                "dollars": 4,
                "stars": 5,
                "review": "review EDIT testing"
        }
        #get
        print("[TEST] Reviews GET")
        print(get_url( localhost + "/reviews/1", silent=True)) 

        #post
        print("[TEST] new review post") 
        print(post_url( localhost + "/reviews" , payload=post_dict))

        #put
        print("[TEST] review edit")
        print(put_url(localhost+"/reviews/10", payload=put_dict))
        
        #delete
        print("[TEST] review delete")
        print(delete_url(localhost + "/reviews/10")) 

        return

def photo_test():
        post_dict = {
                "userid": 1,
                "businessid": 1,
                "caption": "PHOTO POST TEST"
        }
        put_dict = {
                "userid": 1,
                "businessid": 1,
                "caption": "PHOTO EDIT TEST"
        }
        #get
        print("[TEST] Photos GET with photoid: 1")
        print(get_url( localhost + "/photos/1", silent=True)) 

        #post
        print("[TEST] new photo post at businessID: 1 and userid: 1") 
        print(post_url( localhost + "/photos" , payload=post_dict))

        #put
        print("[TEST] existed photo edit")
        print(put_url(localhost+ "/photos/10", payload=put_dict))
        
        #delete
        print("[TEST] existed photo delete")
        print(delete_url(localhost + "/photos/10")) 

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