import urllib.request
import urllib.error
import json
import sys

BASE_URL = "http://localhost:8080/api"

def test_login(username, password):
    print(f"Testing login for {username}...")
    url = f"{BASE_URL}/auth/login"
    data = json.dumps({
        "username": username,
        "password": password
    }).encode('utf-8')
    
    req = urllib.request.Request(url, data=data, headers={'Content-Type': 'application/json'})
    
    try:
        with urllib.request.urlopen(req) as response:
            if response.status == 200:
                print(f"SUCCESS: Logged in as {username}")
                print(response.read().decode('utf-8'))
                return True
    except urllib.error.HTTPError as e:
        print(f"FAILED: Could not login as {username}")
        print(f"Status: {e.code}")
        print(e.read().decode('utf-8'))
        return False
    except Exception as e:
        print(f"ERROR: {e}")
        return False

if __name__ == "__main__":
    success_admin = test_login("Ronaldo", "admin")
    success_user = test_login("usuario", "user")
    
    if success_admin and success_user:
        print("\nALL TESTS PASSED")
        sys.exit(0)
    else:
        print("\nTESTS FAILED")
        sys.exit(1)
