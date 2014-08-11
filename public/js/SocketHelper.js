var SocketHelper = function(params) {

	var self = this, 
			controls = new WebSocket('ws://ngrok.com:34810/ws'); // note: this is hardcoded
			isStreaming = false;

	this.init = function() {
		console.log(params);
		if (params.isBroadcaster) {
			this.initBroadcastSession(params.broadcast);
		} else {
			// this.initWatchSession(params.broadcast);
			this.initBroadcastSession(params.broadcast);
		}
	};

	this.initBroadcastSession = function(broadcast) {

		window.instacam = new InstaCam();
		instacam.connect("ws://" + broadcast.cameras[0] + "/ws");

		$(document).keydown(function(e) {
			switch(e.which) {
			    case 49: // "1" key
			    	self._changeCamera(broadcast.cameras[0]);		    	
			    break;

			    case 50: // "2" key
			    	self._changeCamera(broadcast.cameras[1]);
			    break;

			    case 51: // "3" key
			    	self._changeCamera(broadcast.cameras[2]);
			    break;

			    case 32: // space bar
			    	var overlay = document.getElementById('stream');
		    		self._toggleStream();

			    	if (isStreaming) {
			    		recordNotice.innerHTML = 'Standby';
			    		overlay.className = 'available';
		    			isStreaming = false;
			    		self.waitForSocketConnection(controls, function() {
			    			controls.send(JSON.stringify({ action: "stop" }));
			    		});		    			
			    	} else {
							recordNotice.innerHTML = 'Live'
							overlay.className = 'recording';
							isStreaming = true;
							self._changeCamera(instacam.address);
			    	}
			    break;

			    default: return; 
			}
			
			e.preventDefault();
		});		
	};

	this._changeCamera = function(camera) {
  	if (instacam.player) instacam.player.stop();
  	if (instacam.client) instacam.client.close();

		instacam.connect("ws://" + camera + "/ws");

		if (params.isBroadcaster) {
    	self.waitForSocketConnection(controls, function() {
    		if (isStreaming) {
	    		controls.send(JSON.stringify({
	    			action: "play",
	    			camera: address
	    		}));
    		}
    	});	
		}	
	};

	this.waitForSocketConnection = function(socket, callback){
    setTimeout(
      function () {
        if (socket.readyState === socket.OPEN) {
            if(callback != null){
                callback(socket);
            }
            return;
        } else {
            self.waitForSocketConnection(socket, callback);
        }
    }, 5);
	}	

	this.initWatchSession = function(broadcast) {
		
		$('#videoContainer').hide();	
		window.instacam = new InstaCam();

		self.waitForSocketConnection(controls, function() {
			controls.onmessage = function(event) {
				var data = JSON.parse(event.data);
				if (data.action == "play") {
					$('#videoContainer').show();
					self._changeCamera(data.camera);
				}
				if (data.action == "stop") {
					instacam.player.stop();
					instacam.client.close();

					intacam.setNotice("thanks for watching");
				}
			}
		});
	};
	
	this._toggleStream = function() {
		$.ajax({
			url: "/" + params.broadcast._id + "/stream", 
			type: 'PUT',
			success: function(result) {
				console.log(result);
			}
		});
	};
}