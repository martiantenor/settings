/* 
   From: http://setthebarlow.com/indexeddb/ 
*/

var wrappedDB = {};
wrappedDB.db = null;
wrappedDB.opened = false;

wrappedDB.open = function(dbName, storeId) {
	return new Promise((resolve, reject) => {
		function createObjectStore(db) {
			return new Promise((resolve, reject) => {
				if (db.objectStoreNames.contains(storeId)) {
					console.log("delete object store");
					db.deleteObjectStore(storeId);
				}
				console.log("creating object store");
				var objectStore = db.createObjectStore(storeId, {keyPath: "key"}); // Create unique identifier for store
				console.log("objectStore", objectStore)

				objectStore.transaction.oncomplete = function() {
					console.log("object store oncomplete");
					wrappedDB.db = db;
					wrappedDB.opened = true;		
					resolve();
				}
				objectStore.transaction.onerror = function(e) {
					var error = "Error in creating object store: " + objectStore.transaction.error;
					logError(error);
					reject(error);
				}			
			});
		}
		
		var request = indexedDB.open(dbName);
		
		request.onsuccess = function(e) {
			wrappedDB.db = e.target.result;
			wrappedDB.opened = true;
			resolve();
		};

	    request.onupgradeneeded = function (e) {
	    	console.log("onupgradeneeded: " + storeId);
			var db = e.target.result;
			createObjectStore(db).then(() => {
				resolve();
			}).catch(error => {
				reject(error);
			});
	    };

	    request.onblocked = function(e) {
	    	reject("Database version can't be upgraded because it's open somewhere else. " + e.target.error);
	    };		
	    
	    request.onerror = function(e) {
	    	reject(e.target.error);
	    };		
	});
}

wrappedDB.putObject = function(storeId, key, value) {
	return new Promise((resolve, reject) => {
		if (wrappedDB.opened === false) {
			reject(new Error("DB not opened"));
		} else {
			var db = wrappedDB.db;
			var trans = db.transaction([storeId], "readwrite");
		   
			trans.onabort = function(e) {
				var error = "trans abort: " + e.target.error;
				logError(error);
				reject(error);
			};

			var store = trans.objectStore(storeId);
		 
			var data = {
				"key": key,
				"value": value
			};
		 
			var request = store.put(data);
			request.onsuccess = function(e) {
				chrome.runtime.sendMessage({command:"indexedDBSettingSaved", key:key});
				resolve();
			};
			request.onerror = function(e) {
				var error = "Error storing object with key: " + key + " " + e.target.error;
				logError(error);
				reject(error);
			};
		}
	});
};
 
wrappedDB.deleteSetting = function(storeId, key) {
	return new Promise((resolve, reject) => {
		if (wrappedDB.opened === false) {
			reject(new Error("DB not opened"));
		} else {
			var db = wrappedDB.db;
			var trans = db.transaction([storeId], "readwrite");

			trans.onabort = function(e) {
				var error = "trans abort: " + e.target.error;
				logError(error);
				reject(error);
			};
			
			var store = trans.objectStore(storeId);
			 
			var request = store.delete(key);
			request.onsuccess = function(e) {
				resolve();
			};
			request.onerror = function(e) {
				var error = "Error deleting object with key: " + key + " " + e.target.error;
				logError(error);
				reject(error);
			};			
		}
	});
};
 
wrappedDB.readAllObjects = function(storeId, objectFoundCallback) {
	return new Promise((resolve, reject) => {
		if (wrappedDB.opened === false) {
			reject(new Error("DB not opened"));
		} else {
			var db = wrappedDB.db;
			var trans = db.transaction([storeId], "readonly");
			
			var store = trans.objectStore(storeId);
		 
			// Get everything in the store;
			var keyRange = IDBKeyRange.lowerBound(0);
			var cursorRequest = store.openCursor(keyRange);
		 
			cursorRequest.onsuccess = function(e) {
				var cursor = e.target.result;
				if (cursor) {
					if (objectFoundCallback) {
						objectFoundCallback(cursor.value);
					}
					cursor.continue();
				} else {
					resolve();
				}
			};
		 
			cursorRequest.onerror = function(e) {
				var error = "Error deleting object with key: " + key + " " + e.target.error;
				logError(error);
				reject(error);
			}					
		}
	});
};

wrappedDB.readObject = function(storeId, key) {
	return new Promise((resolve, reject) => {
		if (wrappedDB.opened === false) {
			reject("wrappedDB not opened");
		} else {
			var trans = wrappedDB.db.transaction([storeId], "readonly");
			var store = trans.objectStore(storeId);
			
			var request = store.get(key);
			request.onsuccess = function(e) {
				if (this.result) {
					resolve(this.result.value);
				} else {
					reject("No result in success");
				}
			};
			request.onerror = function(e) {
				var error = "Error reading object with key: " + key + " " + e.target.error;
				logError(error);
				reject(error);
			};
		}
	});
};
