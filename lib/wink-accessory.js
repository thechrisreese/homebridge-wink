var wink = require('wink-js');
var inherits = require('util').inherits;
var Promise = require('promise');
var Service, Characteristic, Accessory, uuid;

module.exports = function (oAccessory, oService, oCharacteristic, ouuid) {
	if (oAccessory) {
		Accessory = oAccessory;
		Service = oService;
		Characteristic = oCharacteristic;
		uuid = ouuid;

		inherits(WinkAccessory, Accessory);
		WinkAccessory.prototype.updatePropertyWithFeedback = updatePropertyWithFeedback;
		WinkAccessory.prototype.updatePropertyWithoutFeedback = updatePropertyWithoutFeedback;
		WinkAccessory.prototype.refreshUntil = refreshUntil;
		WinkAccessory.prototype.checkPropertyIsSet = checkPropertyIsSet;refreshUntilPropertyIsSet
		WinkAccessory.prototype.sendUpdateToWink = sendUpdateToWink;
		WinkAccessory.prototype.refreshUntilPropertyIsSet = refreshUntilPropertyIsSet;
		WinkAccessory.prototype.updateProperty = updateProperty;
		WinkAccessory.prototype.createWinkUpdate = createWinkUpdate;
		WinkAccessory.prototype.getServices = getServices;
		WinkAccessory.prototype.handleResponse = handleResponse;
	}
	return WinkAccessory;
};
module.exports.WinkAccessory = WinkAccessory;

function WinkAccessory(platform, device, deviceId) {
	this.platform = platform;
	this.device = device;
	this.deviceId = deviceId;
	this.name = device.name;
	this.log = platform.log;

	var idKey = 'hbdev:wink:' + this.deviceGroup + ':' + this.deviceId;
	var id = uuid.generate(idKey);
	Accessory.call(this, this.name, id);
	this.uuid_base = id;

	this.control = wink.device_group(this.deviceGroup).device_id(this.deviceId);

	// set some basic properties (these values are arbitrary and setting them is optional)
	this
		.getService(Service.AccessoryInformation)
		.setCharacteristic(Characteristic.Manufacturer, this.device.device_manufacturer)
		.setCharacteristic(Characteristic.Model, "_" + this.device.model_name);
}

var delay = function (time) {
	return new Promise(function (fulfill) {
		setTimeout(fulfill, time);
	});
};

var refreshUntil = function (maxTimes, predicate, callback, interval, incrementInterval, sProperty) {
	var that = this;
	if (!interval) {
		interval = 500;
	}
	if (!incrementInterval) {
		incrementInterval = 500;
	}
	setTimeout(function () {
		that.control.refresh(function () {
			if (predicate == undefined || predicate(sProperty) == true) {
				if (callback) callback(true, that.device, sProperty);
			} else if (maxTimes > 0) {
				maxTimes = maxTimes - 1;
				interval += incrementInterval;
				that.refreshUntil(maxTimes, predicate, callback, interval, incrementInterval, sProperty);
			} else {
				if (callback) callback(false, that.device, sProperty);
			}
		});
	}, interval);
};

var createWinkUpdate = function(sProperty, sTarget) {
	this.log("Changing target property '" + sProperty + "' of the " + this.device.device_group + " called " + this.device.name + " to " + sTarget);
	if (this.device.desired_state == undefined) {
		callback(Error("Unsupported"));
		return;
	}

	var update = {
		"desired_state": {}
	};

	if (sProperty instanceof Array) {
		for (var i = 0; i < sProperty.length; i++) {
			update.desired_state[sProperty[i]] = sTarget[i];
		}
	} else {
		if (this.device.desired_state[sProperty] == undefined) {
			callback(Error("Unsupported"));
			return;
		}
		update.desired_state[sProperty] = sTarget;
	}
	return update;
};

var checkPropertyIsSet = function (sProperty) {
	return this.device.last_reading[sProperty] == this.device.desired_state[sProperty];
};

var sendUpdateToWink = function (update) {
	return new Promise(function (resolve, reject) {
		if (!update) {
			reject(new Error("You must provide an update to run"));
		}
		this.control.update(update, function (res) {
			if (!res) {
				reject(new Error("No response from Wink"));
			} else if (res.errors && res.errors.length > 0) {
				reject(res.errors[0]);
			} else if (res.data) {
				this.device = res.data;
				if (this.loadData) this.loadData();
				resolve(this.device);
			}
		}.bind(this));
	}.bind(this));
};

var refreshUntilPropertyIsSet = function (maxTimes, interval, incrementInterval, sProperty) {
	return new Promise(function (resolve, reject) {
		this.refreshUntil(maxTimes, function () {
			return checkPropertyIsSet(sProperty);
		}, resolve, interval, incrementInterval, sProperty);
	}.bind(this));
};

var updateProperty = function(data, sProperty, sTarget, waitForUpdate, numberOfRetries) {
	var updateTask = this.sendUpdateToWink(data);
	if (waitForUpdate) {
		updateTask = updateTask
			.then(function(){
				return this.refreshUntilPropertyIsSet(5, 1000, 500, sProperty);
			}.bind(this))
			.then(function(completed)
			{
				if (completed) {
					this.log("Successfully changed target property '" + sProperty + "' of the " + this.device.device_group + " called " + this.device.name + " to " + sTarget);
					return null;
				}

				if (numberOfRetries && numberOfRetries > 0) {
					this.log("Unable to determine if update was successful. Retrying update.");
					return this.updateProperty(sProperty, sTarget, true, numberOfRetries - 1);
				}

				this.log("Unable to determine if update was successful.");
				return null;
			}.bind(this));
	}
	return updateTask
		.then(function(){
			//TODO: return the HomeKit value
			return null;
		});
};

var updateFunction = function(waitForUpdate, numberOfRetries)
{
	return function (callback, sProperty, sTarget) {
		sTarget = null;
		var data = this.createWinkUpdate(sProperty, sTarget);
		this.updateProperty(data, sProperty, sTarget, waitForUpdate, numberOfRetries)
			.done(function (val) {
				callback(null, val);
			}, function(err){
				callback(err);
			});
	};
};

var updatePropertyWithFeedback = updateFunction(true, 1);

var updatePropertyWithoutFeedback = updateFunction(false);

var getServices = function () {
	return this.services;
};
