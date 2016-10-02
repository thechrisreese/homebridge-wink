var inherits = require('util').inherits;

var WinkAccessory, Accessory, Service, Characteristic, uuid;

/*
 *   Doorbell Accessory
 */

module.exports = function (oWinkAccessory, oAccessory, oService, oCharacteristic, ouuid) {
	if (oWinkAccessory) {
		WinkAccessory = oWinkAccessory;
		Accessory = oAccessory;
		Service = oService;
		Characteristic = oCharacteristic;
		uuid = ouuid;

		inherits(WinkDoorbellAccessory, WinkAccessory);
		WinkDoorbellAccessory.prototype.loadData = loadData;
		WinkDoorbellAccessory.prototype.deviceGroup = 'doorbells';
	}
	return WinkDoorbellAccessory;
};
module.exports.WinkDoorbellAccessory = WinkDoorbellAccessory;

function WinkDoorbellAccessory(platform, device) {
	WinkAccessory.call(this, platform, device, device.door_bell_id);

	var that = this;

	// Get Current State
	if (that.device.last_reading.button_pressed !== undefined) 
		this
			.getService(Service.ButtonPressed)
			.getCharacteristic(Characteristic.ProgrammableSwitchEvent)
			.on('get', function (callback) {
				callback(null, that.device.last_reading.button_pressed);
			});
	
	if (that.device.last_reading.motion !== undefined) 
		this
			.getService(Service.Motion)
			.getCharacteristic(Characteristic.ProgrammableSwitchEvent)
			.on('get', function (callback) {
				callback(null, that.device.last_reading.motion);
			});
	
	this.loadData();
}

var loadData = function () {
	if (this.device.last_reading.button_pressed !== undefined) 
		this.getService(Service.ButtonPressed)
			.getCharacteristic(Characteristic.ProgrammableSwitchEvent)
			.getValue();
	if (this.device.last_reading.motion !== undefined) 
		this.getService(Service.Motion)
			.getCharacteristic(Characteristic.ProgrammableSwitchEvent)
			.getValue();

	
};



//Service.Doorbell = function(displayName, subtype) {
  //Service.call(this, displayName, '0000004A-0000-1000-8000-0026BB765291', subtype);

  // Required Characteristics
 // this.addCharacteristic(Characteristic.CurrentHeatingCoolingState);
 // this.addCharacteristic(Characteristic.TargetHeatingCoolingState);
  //this.addCharacteristic(Characteristic.CurrentTemperature);
  //this.addCharacteristic(Characteristic.TargetTemperature);
  //this.addCharacteristic(Characteristic.TemperatureDisplayUnits);

  // Optional Characteristics
 // this.addOptionalCharacteristic(Characteristic.CurrentRelativeHumidity);
 // this.addOptionalCharacteristic(Characteristic.TargetRelativeHumidity);
 // this.addOptionalCharacteristic(Characteristic.CoolingThresholdTemperature);
 // this.addOptionalCharacteristic(Characteristic.HeatingThresholdTemperature);
 // this.addOptionalCharacteristic(Characteristic.Name);

//inherits(Service.Doorbell, Service);

//Service.Doorbell.UUID = '0000004A-0000-1000-8000-0026BB765291';
