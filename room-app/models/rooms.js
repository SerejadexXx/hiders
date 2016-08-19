var Room = function(name, code, server_address) {
    this.name = name;
    this.code = code;
    this.server_address = server_address;
};

var rooms = [];
var AddRoom = function(name, code, server_address) {
    if (rooms.filter(function(room) {
            return room.code == code
        }) > 0) {
        return 0;
    }
    rooms.push(new Room(name, code, server_address));
    return 1;
};

module.exports = {

};