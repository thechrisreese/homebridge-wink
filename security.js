var wink = require('wink-js');
var inherits = require('util').inherits;

/*
 *   Generic Accessory
 */
var WinkAccessory, Accessory, Service, Characteristic, uuid;

/*
 *   Lock Accessory
 */

module.exports = function (oWinkAccessory, oAccessory, oService, oCharacteristic, ouuid) {
	if (oWinkAccessory) {
		WinkAccessory = oWinkAccessory;
		Accessory = oAccessory;
		Service = oService;
		Characteristic = oCharacteristic;
		uuid = ouuid;

		inherits(WinkSecurityAccessory, WinkAccessory);
		WinkSecurityAccessory.prototype.loadData = loadData;
		WinkSecurityAccessory.prototype.deviceGroup = 'securitysystem';
	}
	return WinkSecurityAccessory;
};
module.exports.WinkSecurityAccessory = WinkSecurityAccessory;

function WinkSecurityAccessory(platform, device) {
	WinkAccessory.call(this, platform, device, device.camera_id);

	var that = this;

	//Items specific to Door Locks:
	this
		.addService(Service.SecuritySystem)
		.getCharacteristic(Characteristic.SecuritySystemCurrentState)
		.on('get', function (callback) {
			switch (that.device.last_reading.mode) {
				case "away":
					callback(null, Characteristic.SecuritySystemCurrentState.AWAY_ARM);
					break;
				case "night":
					callback(null, Characteristic.SecuritySystemCurrentState.NIGHT_ARM);
					break;
				case "home":
					callback(null, Characteristic.SecuritySystemCurrentState.STAY_ARM);
					break;
				default:
					callback(null, Characteristic.SecuritySystemCurrentState.DISARMED);
					break;
			}
		});

	this
		.getService(Service.SecuritySystem)
		.getCharacteristic(Characteristic.SecuritySystemTargetState)
		.on('get', function (callback) {
			switch (that.device.desired_state.mode) {
				case "away":
					callback(null, Characteristic.SecuritySystemTargetState.AWAY_ARM);
					break;
				case "night":
					callback(null, Characteristic.SecuritySystemTargetState.NIGHT_ARM);
					break;
				case "home":
					callback(null, Characteristic.SecuritySystemTargetState.STAY_ARM);
					break;
				default:
					callback(null, Characteristic.SecuritySystemTargetState.DISARMED);
					break;
			}
		})
		.on('set', function (value, callback) {
			switch (value) {
				case Characteristic.SecuritySystemTargetState.NIGHT_ARM:
					that.updateWinkProperty(callback, "mode", "night");
					break;
				case Characteristic.SecuritySystemTargetState.AWAY_ARM:
					that.updateWinkProperty(callback, "mode", "away");
					break;
				case Characteristic.SecuritySystemTargetState.STAY_ARM:
					that.updateWinkProperty(callback, "mode", "home");
					break;
			}
		});



	this.loadData();
}

var loadData = function () {
	this.getService(Service.SecuritySystem)
		.getCharacteristic(Characteristic.SecuritySystemCurrentState)
		.getValue();
	this.getService(Service.SecuritySystem)
		.getCharacteristic(Characteristic.SecuritySystemTargetState)
		.getValue();
};


//Service.SecuritySystem = function(displayName, subtype) {
  //Service.call(this, displayName, '0000007E-0000-1000-8000-0026BB765291', subtype);

  // Required Characteristics
  //this.addCharacteristic(Characteristic.SecuritySystemCurrentState);
  //this.addCharacteristic(Characteristic.SecuritySystemTargetState);

  // Optional Characteristics
  //this.addOptionalCharacteristic(Characteristic.StatusFault);
  //this.addOptionalCharacteristic(Characteristic.StatusTampered);
  //this.addOptionalCharacteristic(Characteristic.SecuritySystemAlarmType);
  //this.addOptionalCharacteristic(Characteristic.Name);
//};

//inherits(Service.SecuritySystem, Service);

//Service.SecuritySystem.UUID = '0000007E-0000-1000-8000-0026BB765291';

//Characteristic.SecuritySystemCurrentState = function() {
  //Characteristic.call(this, 'Security System Current State', '00000066-0000-1000-8000-0026BB765291');
  //this.setProps({
   // format: Characteristic.Formats.UINT8,
   // perms: [Characteristic.Perms.READ, Characteristic.Perms.NOTIFY]
 // });
  //this.value = this.getDefaultValue();
//};

//inherits(Characteristic.SecuritySystemCurrentState, Characteristic);

//Characteristic.SecuritySystemCurrentState.UUID = '00000066-0000-1000-8000-0026BB765291';

// The value property of SecuritySystemCurrentState must be one of the following:
//Characteristic.SecuritySystemCurrentState.STAY_ARM = 0;
//Characteristic.SecuritySystemCurrentState.AWAY_ARM = 1;
//Characteristic.SecuritySystemCurrentState.NIGHT_ARM = 2;
//Characteristic.SecuritySystemCurrentState.DISARMED = 3;
//Characteristic.SecuritySystemCurrentState.ALARM_TRIGGERED = 4;

/**
 * Characteristic "Security System Target State"
 */

//Characteristic.SecuritySystemTargetState = function() {
  //Characteristic.call(this, 'Security System Target State', '00000067-0000-1000-8000-0026BB765291');
  //this.setProps({
    //format: Characteristic.Formats.UINT8,
    //perms: [Characteristic.Perms.READ, Characteristic.Perms.WRITE, Characteristic.Perms.NOTIFY]
  //});
  //this.value = this.getDefaultValue();
//};

//inherits(Characteristic.SecuritySystemTargetState, Characteristic);

//Characteristic.SecuritySystemTargetState.UUID = '00000067-0000-1000-8000-0026BB765291';

// The value property of SecuritySystemTargetState must be one of the following:
//Characteristic.SecuritySystemTargetState.STAY_ARM = 0;
//Characteristic.SecuritySystemTargetState.AWAY_ARM = 1;
//Characteristic.SecuritySystemTargetState.NIGHT_ARM = 2;
//Characteristic.SecuritySystemTargetState.DISARM = 3;
