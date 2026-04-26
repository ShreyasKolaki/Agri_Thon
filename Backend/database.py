import os
from copy import deepcopy

from bson import ObjectId
from dotenv import load_dotenv
from pymongo import MongoClient
from pymongo.errors import PyMongoError, ServerSelectionTimeoutError

load_dotenv()

MONGO_URL = os.getenv("MONGO_URI")
DATABASE_NAME = os.getenv("DATABASE_NAME", "agri_db").strip('"')


class FakeInsertResult:
    def __init__(self, inserted_id):
        self.inserted_id = inserted_id


class FakeUpdateResult:
    def __init__(self, modified_count):
        self.modified_count = modified_count


def _matches(document, query):
    if not query:
        return True

    for key, expected in query.items():
        if key == "$or":
            if not any(_matches(document, condition) for condition in expected):
                return False
            continue

        if document.get(key) != expected:
            return False

    return True


def _project(document, projection):
    if not projection:
        return deepcopy(document)

    result = deepcopy(document)
    for key, include in projection.items():
        if include == 0:
            result.pop(key, None)
    return result


class FakeCollection:
    def __init__(self):
        self._documents = []

    def insert_one(self, document):
        item = deepcopy(document)
        item.setdefault("_id", ObjectId())
        self._documents.append(item)
        return FakeInsertResult(item["_id"])

    def find_one(self, query=None):
        for document in self._documents:
            if _matches(document, query or {}):
                return deepcopy(document)
        return None

    def find(self, query=None, projection=None):
        return [
            _project(document, projection)
            for document in self._documents
            if _matches(document, query or {})
        ]

    def update_one(self, query, update):
        for document in self._documents:
            if not _matches(document, query):
                continue

            for key, value in update.get("$set", {}).items():
                document[key] = value

            for key, value in update.get("$inc", {}).items():
                document[key] = document.get(key, 0) + value

            return FakeUpdateResult(1)

        return FakeUpdateResult(0)


class FakeDatabase:
    def __init__(self):
        self._collections = {}

    def __getitem__(self, name):
        if name not in self._collections:
            self._collections[name] = FakeCollection()
        return self._collections[name]

    def __getattr__(self, name):
        return self[name]


def _connect_database():
    if not MONGO_URL:
        return FakeDatabase(), "fake"

    try:
        mongo_client = MongoClient(MONGO_URL, serverSelectionTimeoutMS=1200)
        mongo_client.admin.command("ping")
        return mongo_client[DATABASE_NAME], "mongodb"
    except (PyMongoError, ServerSelectionTimeoutError):
        return FakeDatabase(), "fake"


db, DB_MODE = _connect_database()

users = db["users"]
crops = db["crops"]
orders = db["orders"]
