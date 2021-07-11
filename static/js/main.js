document.getElementById("slotDate").defaultValue = getTodayDate();	
	fetchStates();
	var intervalId = null;
	var doseElement = document.getElementById('doseSelect');	
	var ageElement = document.getElementById('ageSelect');
	var vaccineElement = document.getElementById('vaccineSelect');	
	
	function fetchStates() {
		var url = "https://cdn-api.co-vin.in/api/v2/admin/location/states";
		var xmlHttp = new XMLHttpRequest();
		xmlHttp.onreadystatechange = function() { 
			if (xmlHttp.readyState == 4 && xmlHttp.status == 200) {
				var statesJson = JSON.parse(xmlHttp.responseText);
				var allStates = statesJson.states;
				var element = document.getElementById('stateSelect');
				removeOptions(element);
				element.innerHTML = '<option value="">' + "-- Select --" + '</option>';
				for (var i = 0; i < allStates.length; i++) {
					element.innerHTML = element.innerHTML +
						'<option value="' + allStates[i]['state_id'] + '">' + allStates[i]['state_name'] + '</option>';
				}
			} 				
		}	
		xmlHttp.open( "GET", url, false ); 
		xmlHttp.send( null );
	}
	
	function populateDistrict(stateElement){
		var url = "https://cdn-api.co-vin.in/api/v2/admin/location/districts/"+stateElement.value;
		var xmlHttp = new XMLHttpRequest();
		xmlHttp.onreadystatechange = function() { 
			if (xmlHttp.readyState == 4 && xmlHttp.status == 200) {
				var districtsJson = JSON.parse(xmlHttp.responseText);
				var allDistricts = districtsJson.districts;
				var element = document.getElementById('distSelect');
				removeOptions(element);
				element.innerHTML = '<option value="">' + "-- Select --" + '</option>';
				for (var i = 0; i < allDistricts.length; i++) {
					element.innerHTML = element.innerHTML +
						'<option value="' + allDistricts[i]['district_id'] + '">' + allDistricts[i]['district_name'] + '</option>';
				}
			} 				
		}	
		xmlHttp.open( "GET", url, false ); 
		xmlHttp.send( null );
	}
	
	function removeOptions(selectElement){
		while (selectElement.options.length > 0) {                
			selectElement.remove(0);
		}        
	}

	function getSlots(theUrl){	
		try {
			var xmlHttp = new XMLHttpRequest();
			xmlHttp.onreadystatechange = function() { 
				if (xmlHttp.readyState == 4 && xmlHttp.status == 200) {
					var response = validateJSON(xmlHttp.responseText);	
					if(response !== false) {
						findAvailSlots(response.centers, "slotsTable");
					}
				} 				
				if(xmlHttp.status == 401 || xmlHttp.status == 400){
					document.getElementById("error").innerHTML = xmlHttp.responseText;			
					document.getElementById("slotsTable").style.display = "none";	
					var errorMessage = (xmlHttp.responseText.length > 0) ? xmlHttp.responseText : "Couldn't receive response from Server";
					document.getElementById('error').innerHTML = errorMessage;
					console.log(errorMessage);
				}
			}			
			xmlHttp.open( "GET", theUrl, false );
			xmlHttp.send(null);
		}
		catch(err) {
			console.log(err.message);
			clearInterval(intervalId);
			document.getElementById("loader").style.display = "none"; 
			document.getElementById("error").innerHTML = "Request Blocked by Server - Try after sometime | "+err.message;			
			document.getElementById("slotsTable").style.display = "none";	
		}
	}
	
	function getTodayDate() {
		var today = new Date();
		var dd = today.getDate();
		var mm = today.getMonth()+1; 
		var yyyy = today.getFullYear();
		if(dd<10) 
		{
			dd='0'+dd;
		} 

		if(mm<10) 
		{
			mm='0'+mm;
		} 
		today = yyyy+'-'+mm+'-'+dd;
		return today;
	}
	
	function getDate(){
		var date = document.getElementById("slotDate").value.split("-");
		return date[2]+'-'+date[1]+'-'+date[0];
	}
	
	function findAvailSlots(allCenters, tableId, linkId) {
		var table = document.getElementById(tableId);			
		var rowCount = table.rows.length;
		var isAvailable = false;
		var slotsFlag = false;
		var vaccineCost = "Free";
		
		for (var i = 1; i < rowCount; i++) {
			table.deleteRow(1);
		}
	
		for(i in allCenters) {
		
			var sessions = allCenters[i].sessions.reverse();
			var hospitalName = allCenters[i].name + "<br>Pincode: "+allCenters[i].pincode;
					
			if(allCenters[i].fee_type === "Paid") { 
				vaccineCost = allCenters[i].vaccine_fees;
			}
						
			for(j in sessions) {
				var availableSlots = sessions[j]["available_capacity"+"_"+doseElement.value];
				var vaccine = sessions[j].vaccine;
				var date = sessions[j].date;
				var minAge = sessions[j].min_age_limit;			
				var searchFlag = false;
				
				if(ageElement.value < 45 && minAge < 45) {
					searchFlag = true;
					slotsFlag = true;
				} 
				if(ageElement.value >= 45 && minAge >= 45) {
					searchFlag = true;
					slotsFlag = true;
				}
				
				if(searchFlag && availableSlots > 0 && (vaccineElement.value === vaccine || vaccineElement.value === "ALL")){ 
					isAvailable = true;
					var row = table.insertRow(1);
					var ageCell = row.insertCell(0);
					var dateCell = row.insertCell(1);
					var slotCell = row.insertCell(2);
					var vaccineCell = row.insertCell(3);
					var hospitalCell = row.insertCell(4);
					var vaccineFee = row.insertCell(5);
					
					slotCell.innerHTML = availableSlots;
					vaccineCell.innerHTML = vaccine;
					dateCell.innerHTML = date;
					ageCell.innerHTML = minAge;
					hospitalCell.innerHTML = hospitalName;
					vaccineFee.innerHTML = (vaccineCost === "Free") ? vaccineCost : vaccineCost.find(obj => obj.vaccine === vaccine).fee;
				}
			
			}
		
		}
		
		if(slotsFlag){
			document.getElementById('error').innerHTML = "All slots are full... keep checking!";
		}
		else {
			document.getElementById('error').innerHTML = "No Vaccination Center is available for booking now... ";
		}
		
		if(isAvailable){
			document.getElementById('error').innerHTML = null;
			document.getElementById("slotsTable").style.display = "block"; 
			
			console.log("Time=="+new Date());
		} else { 
			document.getElementById("slotsTable").style.display = "none"; 
		}
	}

	function searchSlot() {
		var distElement = document.getElementById('distSelect');
		var pinElement = document.getElementById('pinSelect');
		document.getElementById('searchSection').innerHTML = getLocationText(distElement, pinElement);
		document.getElementById("loader").style.display = "block"; 
		var url = getUrl(distElement, pinElement);
		getSlots(url);	
	}
	
	function getUrl(distElement, pinElement){
		var url = "https://cdn-api.co-vin.in/api/v2/appointment/sessions/public/";   		
		if(document.getElementById("stateSelectRadio").checked){
			url = url+"calendarByDistrict?district_id="+distElement.value+"&date="+getDate();
		} else {
			url = url+"calendarByPin?pincode="+pinElement.value+"&date="+getDate();
		}
		return url;
	}
	
	function getLocationText(distElement, pinElement){
		if(document.getElementById("stateSelectRadio").checked && distElement.value != ""){
			return "Searching Slots for "+distElement.options[distElement.selectedIndex].text;
		} else if(document.getElementById("pinSelectRadio").checked && pinElement.value != "") {
			return "Searching Slots for PIN: "+pinElement.value;
		} else {
			return null;
		}
	}
	
	function validateJSON(text) {
        if (typeof text !== "string") {
            return false;
        }
        try {
            var jsonData = JSON.parse(text);
            return jsonData;
        } catch (error) {
			document.getElementById("error").innerHTML = text;			
			document.getElementById("slotsTable").style.display = "none";	
			console.log(text+" --- "+error.message);
            return false;
        }
    }
		
	function startInterval(functionName, milliSec) {
	  functionName();	  
	  intervalId = setInterval(functionName, milliSec);
	}
	
	function toggleSearchType(element) {
		if(element.value === "stateSelectRadio") {
			document.getElementById("stateSelect").disabled = false; 	
			document.getElementById("distSelect").disabled = false; 	
			document.getElementById("pinSelect").disabled = true; 
			document.getElementById("pinSelect").value = "";
			var element = document.getElementById('distSelect');
			removeOptions(element);
			element.innerHTML = '<option value="">' + "-- Select --" + '</option>';			
		} else {
			document.getElementById("pinSelect").disabled = false; 	
			document.getElementById("stateSelect").disabled = true; 	
			document.getElementById("distSelect").disabled = true; 
			document.getElementById("stateSelect").value = ""; 	
			document.getElementById("distSelect").value = ""; 			
		}
	}

    function show1(){
        document.getElementById('pinshow').style.display ='none';
        document.getElementById('disshow').style.display = 'flex';
    }
    function show2(){
        document.getElementById('disshow').style.display = 'none';
        document.getElementById('pinshow').style.display ='block';
    }