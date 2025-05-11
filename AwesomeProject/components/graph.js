let graph = {
  "Dilshad Garden": {
      "Jhilmil": 893.31
  },
  "Jhilmil": {
      "Dilshad Garden": 893.31,
      "Mansrover Park": 1096.67
  },
  "Mansrover Park": {
      "Jhilmil": 1096.67,
      "Shahdara": 1247.52
  },
  "Shahdara": {
      "Mansrover Park": 1247.52,
      "Welcome": 1123.45
  },
  "Welcome": { 
      "Shahdara": 1123.45,
      "Seelampur": 1352.87,
      "East Azad Nagar": 1243.21, // Pink Line
      "Jaffrabad": 1410.7 // Pink Line NE Extension Start
  },
  "Seelampur": {
      "Welcome": 1352.87,
      "Shastri Park": 1475.32
  },
  "Shastri Park": {
      "Seelampur": 1475.32,
      "Kashmere Gate": 2217.64
  },
  "Kashmere Gate": { // Interchange Red/Yellow/Violet
      "Shastri Park": 2217.64, // Red Line
      "Tis Hazari": 1543.21, // Red Line
      "Civil Lines": 1687.54, // Yellow Line
      "Chandni Chowk": 1456.78, // Yellow Line
      "Lal Quila": 1243.56 // Violet Line
  },
  "Chandni Chowk": {
      "Kashmere Gate": 1456.78,
      "Chawri Bazar": 1023.45
  },
  "Chawri Bazar": {
      "Chandni Chowk": 1023.45,
      "New Delhi": 1198.76
  },
  "New Delhi": { // Interchange Yellow/Airport Line
      "Chawri Bazar": 1198.76,
      "Rajiv Chowk": 876.54,
      "Shivaji Stadium": 2134.67 // Airport Line
  },
  "Rajiv Chowk": { // Interchange Yellow/Blue
      "New Delhi": 876.54, // Yellow Line
      "Patel Chowk": 1321.43, // Yellow Line
      "Barakhamba": 945.78, // Blue Line
      "R K Ashram Marg": 1400.2 // Blue Line (Corrected)
  },
  "Patel Chowk": {
      "Rajiv Chowk": 1321.43,
      "Central Secretariat": 864.32
  },
  "Central Secretariat": { // Interchange Yellow/Violet
      "Patel Chowk": 864.32, // Yellow Line
      "Udyog Bhawan": 765.43, // Yellow Line
      "Khan Market": 1654.32, // Violet Line
      "Janpath": 1132.87 // Violet Line
  },
  "Udyog Bhawan": {
      "Central Secretariat": 765.43,
      "Lok Kalyan Marg": 1543.21
  },
  "Lok Kalyan Marg": {
      "Udyog Bhawan": 1543.21,
      "Jorbagh": 1234.56
  },
  "Jorbagh": {
      "Lok Kalyan Marg": 1234.56,
      "Dilli Haat - INA": 1432.10
  },
  "Dilli Haat - INA": { // Interchange Yellow/Pink
      "Jorbagh": 1432.10, // Yellow Line
      "AIIMS": 987.65, // Yellow Line
      "Sarojini Nagar": 1243.76, // Pink Line
      "South Extension": 1176.43 // Pink Line
  },
  "AIIMS": {
      "Dilli Haat - INA": 987.65,
      "Green Park": 1165.43
  },
  "Green Park": {
      "AIIMS": 1165.43,
      "Hauz Khas": 1387.65
  },
  "Hauz Khas": { // Interchange Yellow/Magenta
      "Green Park": 1387.65, // Yellow Line
      "Malviya Nagar": 1243.21, // Yellow Line
      "IIT Delhi": 1765.43, // Magenta Line
      "R.K. Puram": 1532.76 // Magenta Line
  },
  "Malviya Nagar": {
      "Hauz Khas": 1243.21,
      "Saket": 1387.65
  },
  "Saket": {
      "Malviya Nagar": 1387.65,
      "Qutab Minar": 1498.76
  },
  "Qutab Minar": {
      "Saket": 1498.76,
      "Chhattarpur": 1765.43
  },
  "Chhattarpur": {
      "Qutab Minar": 1765.43,
      "Sultanpur": 1354.32
  },
  "Sultanpur": {
      "Chhattarpur": 1354.32,
      "Ghitorni": 1876.54
  },
  "Ghitorni": {
      "Sultanpur": 1876.54,
      "Arjan Garh": 1432.10
  },
  "Arjan Garh": {
      "Ghitorni": 1432.10,
      "Gurudronacharya": 1565.43
  },
  "Gurudronacharya": {
      "Arjan Garh": 1565.43,
      "Sikanderpur (Rapid Metro)": 1287.65
  },
  "Sikanderpur (Rapid Metro)": { // Interchange Yellow/Rapid Metro
      "Gurudronacharya": 1287.65, // Yellow Line
      "M G Road": 1354.32, // Yellow Line
      "Phase 1 (Rapid Metro)": 987.65 // Rapid Metro
  },
  "M G Road": {
      "Sikanderpur (Rapid Metro)": 1354.32,
      "IFFCO Chowk": 1765.43
  },
  "IFFCO Chowk": {
      "M G Road": 1765.43,
      "Millennium City Centre Gurugram": 2165.43 // Updated Name
  },
  "Millennium City Centre Gurugram": { // Updated Name
      "IFFCO Chowk": 2165.43
  },
  "Civil Lines": {
      "Kashmere Gate": 1687.54,
      "Vidhan Sabha": 1243.21
  },
  "Vidhan Sabha": {
      "Civil Lines": 1243.21,
      "Vishwavidyalaya": 986.54
  },
  "Vishwavidyalaya": {
      "Vidhan Sabha": 986.54,
      "GTB Nagar": 1176.54
  },
  "GTB Nagar": {
      "Vishwavidyalaya": 1176.54,
      "Model Town": 1243.21
  },
  "Model Town": {
      "GTB Nagar": 1243.21,
      "Azadpur": 1432.10 // Corrected connection via Azadpur
  },
  "Adarsh Nagar": {
      "Azadpur": 1300.1, // Corrected connection via Azadpur (Added)
      "Jahangirpuri": 1398.76
  },
  "Jahangirpuri": {
      "Adarsh Nagar": 1398.76,
      "Haiderpur Badli Mor": 1765.43
  },
  "Haiderpur Badli Mor": {
      "Jahangirpuri": 1765.43,
      "Samaypur Badli": 1932.10
  },
  "Samaypur Badli": {
      "Haiderpur Badli Mor": 1932.10
  },
  "Barakhamba": { // Blue Line
      "Rajiv Chowk": 945.78,
      "Mandi House": 1132.10
  },
  "Mandi House": { // Interchange Blue/Violet
      "Barakhamba": 1132.10, // Blue Line
      "Supreme Court": 1243.21, // Blue Line (Corrected Name)
      "Janpath": 1087.65, // Violet Line
      "ITO": 1132.10 // Violet Line
  },
  "Janpath": { // Violet Line
      "Mandi House": 1087.65,
      "Central Secretariat": 1132.87,
       "Khan Market": 1243.21 // This connection seems wrong based on map, should be Central Sec only from here? Let's remove.
      // "Khan Market": 1243.21 // Removed potentially incorrect link
  },
  "Khan Market": { // Violet Line
      "Central Secretariat": 1654.32,
      // "Janpath": 1243.21, // Removed potentially incorrect link
      "JLN Stadium": 1765.43
  },
  "JLN Stadium": {
      "Khan Market": 1765.43,
      "Jangpura": 1398.76
  },
  "Jangpura": {
      "JLN Stadium": 1398.76,
      "Lajpat Nagar": 1554.32
  },
  "Lajpat Nagar": { // Interchange Violet/Pink
      "Jangpura": 1554.32, // Violet Line
      "Moolchand": 1243.21, // Violet Line
      "Vinobapuri": 1432.10, // Pink Line
      "South Extension": 1321.54 // Pink Line
  },
  "Moolchand": {
      "Lajpat Nagar": 1243.21,
      "Kailash Colony": 1354.32
  },
  "Kailash Colony": {
      "Moolchand": 1354.32,
      "Nehru Place": 1176.54
  },
  "Nehru Place": {
      "Kailash Colony": 1176.54,
      "Kalkaji Mandir": 1432.10
  },
  "Kalkaji Mandir": { // Interchange Violet/Magenta
      "Nehru Place": 1432.10, // Violet Line
      "Govind Puri": 1265.43, // Violet Line
      "Nehru Enclave": 1432.10, // Magenta Line
      "Okhla NSIC": 1654.32 // Magenta Line
      // Removed incorrect Okhla Bird Sanctuary link
  },
  "Govind Puri": {
      "Kalkaji Mandir": 1265.43,
      "Jasola Apollo": 1487.65
  },
  "Jasola Apollo": {
      "Govind Puri": 1487.65,
      "Sarita Vihar": 1798.76
  },
  "Sarita Vihar": {
      "Jasola Apollo": 1798.76,
      "Mohan Estate": 1543.21
  },
  "Mohan Estate": {
      "Sarita Vihar": 1543.21,
      "Tughlakabad": 1687.65
  },
  "Tughlakabad": {
      "Mohan Estate": 1687.65,
      "Badarpur Border": 1765.43 // Using more common name
  },
  "Badarpur Border": { // Using more common name
      "Tughlakabad": 1765.43,
      "Sarai": 1432.10
  },
  "Sarai": {
      "Badarpur Border": 1432.10,
      "NHPC Chowk": 1654.32
  },
  "NHPC Chowk": {
      "Sarai": 1654.32,
      "Mewala Maharajpur": 1487.65
  },
  "Mewala Maharajpur": {
      "NHPC Chowk": 1487.65,
      "Sector 28": 1354.32
  },
  "Sector 28": {
      "Mewala Maharajpur": 1354.32,
      "Raja Nahar Singh": 1876.54 // Updated Name
  },
  "Raja Nahar Singh": { // Updated Name
      "Sector 28": 1876.54,
      "Escorts Mujesar": 1876.54
  },
  "Supreme Court": { // Was Pragati Maidan (Blue Line)
      "Mandi House": 1243.21,
      "Indraprastha": 1400.5 // Corrected connection
  },
  "Indraprastha": {
      "Supreme Court": 1400.5, // Corrected connection
      "Yamuna Bank": 2176.54
  },
  "Yamuna Bank": { // Blue Line Branch Point
      "Indraprastha": 2176.54,
      "Akshardham": 1765.43, // To Noida
      "Laxmi Nagar": 1354.32 // To Vaishali
  },
  "Akshardham": {
      "Yamuna Bank": 1765.43,
      "Mayur Vihar Phase 1": 2098.76
  },
  "Mayur Vihar Phase 1": { // Interchange Blue/Pink
      "Akshardham": 2098.76, // Blue Line
      "Mayur Vihar Extension": 1187.65, // Blue Line
      "Hazrat Nizamuddin": 2187.65, // Pink Line
      "Mayur Vihar Pocket 1": 1310.1 // Pink Line (Added)
  },
  "Mayur Vihar Extension": {
      "Mayur Vihar Phase 1": 1187.65,
      "New Ashok Nagar": 1354.32
  },
  "New Ashok Nagar": {
      "Mayur Vihar Extension": 1354.32,
      "Noida Sector 15": 1765.43
  },
  "Noida Sector 15": {
      "New Ashok Nagar": 1765.43,
      "Noida Sector 16": 1243.21
  },
  "Noida Sector 16": {
      "Noida Sector 15": 1243.21,
      "Noida Sector 18": 1432.10
  },
  "Noida Sector 18": {
      "Noida Sector 16": 1432.10,
      "Botanical Garden": 1543.21
  },
  "Botanical Garden": { // Interchange Blue/Magenta
      "Noida Sector 18": 1543.21, // Blue Line
      "Golf Course": 1354.32, // Blue Line
      "Okhla Bird Sanctuary": 1550.6, // Magenta Line (Corrected)
      "Kalindi Kunj": 2176.54 // Removed this connection, OBS is the adjacent Magenta station
  },
  "Golf Course": {
      "Botanical Garden": 1354.32,
      "Wave City Center Noida": 1632.10
  },
  "Wave City Center Noida": {  // formerly Noida City Centre
      "Golf Course": 1632.10,
      "Noida Sector 34": 1432.10
  },
  "Noida Sector 34": {
      "Wave City Center Noida": 1432.10,
      "Noida Sector 52": 1765.43
  },
  "Noida Sector 52": { // Interchange Blue/Aqua (Noida Metro) - Aqua line not in this graph
      "Noida Sector 34": 1765.43,
      "Noida Sector 61": 1243.21
  },
  "Noida Sector 61": {
      "Noida Sector 52": 1243.21,
      "Noida Sector 59": 1132.10
  },
  "Noida Sector 59": {
      "Noida Sector 61": 1132.10,
      "Noida Sector 62": 1265.43
  },
  "Noida Sector 62": {
      "Noida Sector 59": 1265.43,
      "Noida Electronic City": 1543.21
  },
  "Noida Electronic City": {
      "Noida Sector 62": 1543.21
  },
  "Laxmi Nagar": { // Blue Line Vaishali Branch
      "Yamuna Bank": 1354.32,
      "Nirman Vihar": 1243.21
  },
  "Nirman Vihar": {
      "Laxmi Nagar": 1243.21,
      "Preet Vihar": 1132.10
  },
  "Preet Vihar": {
      "Nirman Vihar": 1132.10,
      "Karkarduma": 1354.32
  },
  "Karkarduma": { // Interchange Blue/Pink
      "Preet Vihar": 1354.32, // Blue Line
      "Anand Vihar ISBT": 1765.43, // Blue Line
      "Karkarduma Court": 1243.21 // Pink Line
  },
  "Anand Vihar ISBT": { // Interchange Blue/Pink
      "Karkarduma": 1765.43, // Blue Line
      "Kaushambi": 1354.32, // Blue Line
      "IP Extension": 1360.6 // Pink Line (Added)
  },
  "Kaushambi": {
      "Anand Vihar ISBT": 1354.32,
      "Vaishali": 1543.21
  },
  "Vaishali": {
      "Kaushambi": 1543.21
  },
  "Karkarduma Court": { // Pink Line
      "Karkarduma": 1243.21,
      "Krishna Nagar": 1132.10
  },
  "Krishna Nagar": { // Pink Line
      "Karkarduma Court": 1132.10,
      "East Azad Nagar": 1087.65
  },
  "East Azad Nagar": { // Pink Line
      "Krishna Nagar": 1087.65,
      "Welcome": 1243.21
  },
  "Jhandewalan": { // Blue Line
      "R K Ashram Marg": 1354.32,
      "Karol Bagh": 1132.10 // Connects to Karol Bagh now
  },
  "Karol Bagh": { // Blue Line
      "Jhandewalan": 1132.10, // Corrected
      "Rajendra Place": 1100.4 // Corrected
  },
  "Rajendra Place": { // Blue Line (Added)
      "Karol Bagh": 1100.4,
      "Patel Nagar": 1200.3
  },
  "Patel Nagar": { // Blue Line
      "Rajendra Place": 1200.3, // Corrected
      "Shadipur": 1243.21
  },
  "R K Ashram Marg": { // Blue Line
      "Jhandewalan": 1354.32,
      "Rajiv Chowk": 1432.10
  },
  "Shadipur": {
      "Patel Nagar": 1243.21,
      "Kirti Nagar": 1354.32
  },
  "Kirti Nagar": { // Interchange Blue/Green
      "Shadipur": 1354.32, // Blue Line
      "Moti Nagar": 1132.10, // Blue Line
      "Satguru Ram Singh Marg": 1243.21 // Green Line Branch
  },
  "Moti Nagar": {
      "Kirti Nagar": 1132.10,
      "Ramesh Nagar": 1087.65
  },
  "Ramesh Nagar": {
      "Moti Nagar": 1087.65,
      "Rajouri Garden": 1354.32
  },
  "Rajouri Garden": { // Interchange Blue/Pink
      "Ramesh Nagar": 1354.32, // Blue Line
      "Tagore Garden": 1243.21, // Blue Line
      "ESI Hospital": 1432.10, // Pink Line (Corrected - check ESI Hospital)
      "Mayapuri": 1432.10 // Pink Line
  },
  "Tagore Garden": {
      "Rajouri Garden": 1243.21,
      "Subhash Nagar": 1132.10
  },
  "Subhash Nagar": {
      "Tagore Garden": 1132.10,
      "Tilak Nagar": 1087.65
  },
  "Tilak Nagar": {
      "Subhash Nagar": 1087.65,
      "Janakpuri East": 1354.32
  },
  "Janakpuri East": {
      "Tilak Nagar": 1354.32,
      "Janakpuri West": 1243.21
  },
  "Janakpuri West": { // Interchange Blue/Magenta
      "Janakpuri East": 1243.21, // Blue Line
      "Uttam Nagar East": 1432.10, // Blue Line
      "Dabri Mor - Janakpuri South": 1876.54 // Magenta Line
  },
  "Uttam Nagar East": {
      "Janakpuri West": 1432.10,
      "Uttam Nagar West": 1087.65
  },
  "Uttam Nagar West": {
      "Uttam Nagar East": 1087.65,
      "Nawada": 1354.32
  },
  "Nawada": {
      "Uttam Nagar West": 1354.32,
      "Dwarka Mor": 1543.21
  },
  "Dwarka Mor": {
      "Nawada": 1543.21,
      "Dwarka": 1765.43
      // Removed incorrect Nangli connection
  },
  "Dwarka": { // Interchange Blue/Grey
      "Dwarka Mor": 1765.43, // Blue Line
      "Dwarka Sector - 14": 1243.21, // Blue Line
      "Nangli": 1610.7 // Grey Line (Added)
  },
  "Dwarka Sector - 14": {
      "Dwarka": 1243.21,
      "Dwarka Sector - 13": 1132.10
  },
  "Dwarka Sector - 13": {
      "Dwarka Sector - 14": 1132.10,
      "Dwarka Sector - 12": 1087.65
  },
  "Dwarka Sector - 12": {
      "Dwarka Sector - 13": 1087.65,
      "Dwarka Sector - 11": 1354.32
  },
  "Dwarka Sector - 11": {
      "Dwarka Sector - 12": 1354.32,
      "Dwarka Sector - 10": 1243.21
  },
  "Dwarka Sector - 10": {
      "Dwarka Sector - 11": 1243.21,
      "Dwarka Sector - 9": 1132.10
  },
  "Dwarka Sector - 9": {
      "Dwarka Sector - 10": 1132.10,
      "Dwarka Sector - 8": 1087.65
  },
  "Dwarka Sector - 8": {
      "Dwarka Sector - 9": 1087.65,
      "Dwarka Sector - 21": 1543.21
  },
  "Dwarka Sector - 21": { // Interchange Blue/Airport Line
      "Dwarka Sector - 8": 1543.21,
      "New Delhi": 3432.10
  },
  "Nangli": { // Grey Line
      "Dwarka": 1610.7, // Corrected
      "Najafgarh": 1876.54
  },
  "Najafgarh": {
      "Nangli": 1876.54,
      "Dhansa Bus Stand": 1243.21
  },
  "Dhansa Bus Stand": {
      "Najafgarh": 1243.21
  },
  // Airport Express Line Stations
  "Shivaji Stadium": {
      "New Delhi": 2134.67,
      "Dhaula Kuan": 2765.43
  },
  "Dhaula Kuan": { // Interchange Airport Line/Pink Line (via skywalk)
      "Shivaji Stadium": 2765.43,
      "Delhi Aerocity": 3187.65,
      "Durgabai Deshmukh South Campus": 1643.21 // Link to Pink Line station
  },
  "Delhi Aerocity": {
      "Dhaula Kuan": 3187.65,
      "IGI Airport": 2876.54
  },
  "IGI Airport": { // Airport Line
      "Delhi Aerocity": 2876.54,
      "Dwarka Sector - 21": 3432.10
  },
  // Violet Line (Kashmere Gate South)
  "Lal Quila": {
      "Kashmere Gate": 1243.56,
      "Jama Masjid": 1087.65
  },
  "Jama Masjid": {
      "Lal Quila": 1087.65,
      "Delhi Gate": 1354.32
  },
  "Delhi Gate": {
      "Jama Masjid": 1354.32,
      "ITO": 1243.21
  },
  "ITO": {
      "Delhi Gate": 1243.21,
      "Mandi House": 1132.10
  },
  // Pink Line (West/South section)
  "Mayapuri": {
      "Rajouri Garden": 1432.10,
      "Naraina Vihar": 1354.32
  },
  "Naraina Vihar": {
      "Mayapuri": 1354.32,
      "Delhi Cantt.": 1765.43
  },
  "Delhi Cantt.": {
      "Naraina Vihar": 1765.43,
      "Durgabai Deshmukh South Campus": 1543.21
  },
  "Durgabai Deshmukh South Campus": { // Interchange Pink Line/Airport Line (via skywalk)
      "Delhi Cantt.": 1543.21,
      "Sir Vishweshwaraiah Moti Bagh": 1354.32,
      "Dhaula Kuan": 1643.21 // Link to Airport Line station
  },
  "Sir Vishweshwaraiah Moti Bagh": {
      "Durgabai Deshmukh South Campus": 1354.32,
      "Bhikaji Cama Place": 1432.10
  },
  "Bhikaji Cama Place": {
      "Sir Vishweshwaraiah Moti Bagh": 1432.10,
      "Sarojini Nagar": 1243.21
  },
  "Sarojini Nagar": {
      "Bhikaji Cama Place": 1243.21,
      "Dilli Haat - INA": 1243.76
  },
  "South Extension": {
      "Dilli Haat - INA": 1176.43,
      "Lajpat Nagar": 1321.54
  },
  "Vinobapuri": {
      "Lajpat Nagar": 1432.10,
      "Ashram": 1243.21
  },
  "Ashram": {
      "Vinobapuri": 1243.21,
      "Sarai Kale Khan": 1432.10
  },
  "Sarai Kale Khan": {
      "Ashram": 1432.10,
      "Hazrat Nizamuddin": 1354.32
  },
  "Hazrat Nizamuddin": { // Pink Line
      "Sarai Kale Khan": 1354.32,
      "Mayur Vihar Phase 1": 2187.65
  },
   // Pink Line (East section - Added)
  "Mayur Vihar Pocket 1": {
      "Mayur Vihar Phase 1": 1310.1,
      "Trilokpuri Sanjay Lake": 1320.2
  },
  "Trilokpuri Sanjay Lake": {
      "Mayur Vihar Pocket 1": 1320.2,
      "East Vinod Nagar - Mayur Vihar Phase 2": 1330.3
  },
  "East Vinod Nagar - Mayur Vihar Phase 2": {
      "Mayur Vihar Pocket 1": 1330.3,
      "Mandawali - West Vinod Nagar": 1340.4
  },
  "Mandawali - West Vinod Nagar": {
      "East Vinod Nagar - Mayur Vihar Phase 2": 1340.4,
      "IP Extension": 1350.5
  },
  "IP Extension": {
      "Mandawali - West Vinod Nagar": 1350.5,
      "Anand Vihar ISBT": 1360.6
  },
  // Pink Line (NE Extension - Added)
  "Jaffrabad": {
      "Welcome": 1410.7,
      "Maujpur - Babarpur": 1420.8
  },
  "Maujpur - Babarpur": {
      "Jaffrabad": 1420.8,
      "Gokulpuri": 1430.9
  },
  "Gokulpuri": {
      "Maujpur - Babarpur": 1430.9,
      "Johri Enclave": 1440.0
  },
  "Johri Enclave": {
      "Gokulpuri": 1440.0,
      "Shiv Vihar": 1450.1
  },
  "Shiv Vihar": {
      "Johri Enclave": 1450.1
  },
  // Magenta Line (South section)
  "IIT": {
      "Hauz Khas": 1765.43,
      "Panchsheel Park": 1354.32
  },
  "Panchsheel Park": {
      "IIT": 1354.32,
      "Chirag Delhi": 1243.21
  },
  "Chirag Delhi": {
      "Panchsheel Park": 1243.21,
      "Greater Kailash": 1354.32
  },
  "Greater Kailash": {
      "Chirag Delhi": 1354.32,
      "Nehru Enclave": 1243.21
  },
  "Nehru Enclave": {
      "Greater Kailash": 1243.21,
      "Kalkaji Mandir": 1432.10
  },
  "Okhla NSIC": {
      "Kalkaji Mandir": 1654.32,
      "Sukhdev Vihar": 1354.32
  },
  "Sukhdev Vihar": {
      "Okhla NSIC": 1354.32,
      "Jamia Millia Islamia": 1243.21
  },
  "Jamia Millia Islamia": {
      "Sukhdev Vihar": 1243.21,
      "Okhla Vihar": 1510.2 // Corrected
  },
  "Okhla Vihar": { // Added
      "Jamia Millia Islamia": 1510.2,
      "Jasola Vihar Shaheen Bagh": 1520.3
  },
  "Jasola Vihar Shaheen Bagh": { // Added
      "Okhla Vihar": 1520.3,
      "Kalindi Kunj": 1530.4
  },
  "Kalindi Kunj": {
      "Jasola Vihar Shaheen Bagh": 1530.4, // Corrected
      "Okhla Bird Sanctuary": 1354.32 // Corrected
  },
  "Okhla Bird Sanctuary": {
      "Kalindi Kunj": 1354.32, // Corrected
      "Botanical Garden": 1550.6 // Corrected
  },
  // Magenta Line (West section)
  "Dabri Mor - Janakpuri South": { // Corrected full station name
      "Janakpuri West": 1876.54,
      "Dashrath Puri": 1543.21
  },
  "Dashrath Puri": {
      "Dabri Mor - Janakpuri South": 1543.21,
      "Palam": 1432.10
  },
  "Palam": {
      "Dashrath Puri": 1432.10,
      "Sadar Bazar Cantonment": 1543.21
  },
  "Sadar Bazar Cantonment": {
      "Terminal 1 - IGI Airport": 1543.21,
      "Palam": 1765.43
  },
  "Terminal 1 - IGI Airport": {
      "Shankar Vihar": 1876.54,
      "Sadar Bazar Cantonment": 2143.21
  },
  "Shankar Vihar": {
      "Terminal 1 - IGI Airport": 2143.21,
      "Vasant Vihar": 1654.32
  },
  "Vasant Vihar": {
      "Shankar Vihar": 1654.32,
      "Munirka": 1243.21
  },
  "Munirka": {
      "Vasant Vihar": 1243.21,
      "M G Road": 1354.32
  },
  "M G Road": {
      "Munirka": 1354.32,
      "Hauz Khas": 1532.76
  },
  // Green Line (Main Line + Branch Start)
  "Satguru Ram Singh Marg": { // Green Line Branch
      "Kirti Nagar": 1243.21,
      "Ashok Park Main": 1450.6 // Corrected
  },
  "Inderlok": { // Interchange Green/Red
      "Ashok Park Main": 1243.21, // Green Line
      "Shastri Nagar": 1354.32, // Red Line
      "Kanhaiya Nagar": 1132.10 // Red Line (Check direction, should be Kanhaiya Nagar)
  },
  "Ashok Park Main": { // Green Line Branch Point
      "Inderlok": 1243.21, // To Inderlok
      "Punjabi Bagh": 1543.21, // Towards Bahadurgarh
      "Satguru Ram Singh Marg": 1450.6 // Towards Kirti Nagar (Corrected)
  },
  "Punjabi Bagh": { // Green Line Main (Check actual name, might be Punjabi Bagh West on maps)
      "Ashok Park Main": 1543.21,
      "Shivaji Park": 1243.21
  },
  "Shivaji Park": {
      "Punjabi Bagh": 1243.21,
      "Madipur": 1087.65
  },
  "Madipur": {
      "Shivaji Park": 1087.65,
      "Paschim Vihar (East)": 1354.32
  },
  "Paschim Vihar (East)": {
      "Madipur": 1354.32,
      "Paschim Vihar (West)": 1243.21
  },
  "Paschim Vihar (West)": {
      "Paschim Vihar (East)": 1243.21,
      "Peera Garhi": 1432.10
  },
  "Peera Garhi": {
      "Paschim Vihar (West)": 1432.10,
      "Udyog Nagar": 1243.21
  },
  "Udyog Nagar": {
      "Peera Garhi": 1243.21,
      "Surajmal Stadium": 1354.32
  },
  "Surajmal Stadium": {
      "Udyog Nagar": 1354.32,
      "Nangloi": 1243.21
  },
   "Nangloi": {
       "Surajmal Stadium": 1243.21,
       "Nangloi Railway Station": 1087.65
   },
  "Nangloi Railway Station": {
      "Nangloi": 1087.65,
      "Rajdhani Park": 1354.32
  },
  "Rajdhani Park": {
      "Nangloi Railway Station": 1354.32,
      "Mundka": 1543.21
  },
  "Mundka": {
      "Rajdhani Park": 1543.21,
      "Mundka Industrial Area": 1243.21
  },
  "Mundka Industrial Area": {
      "Mundka": 1243.21,
      "Ghevra Metro Station": 1432.10
  },
  "Ghevra Metro Station": {
      "Mundka Industrial Area": 1432.10,
      "Mundka": 1654.32
  },
  "Tikri Kalan": {
      "Ghevra Metro Station": 1654.32,
      "Tikri Border": 1243.21
  },
  "Tikri Border": {
      "Tikri Kalan": 1243.21,
      "Pandit Shree Ram Sharma": 1765.43
  },
  "Pandit Shree Ram Sharma": { // Bahadurgarh section
      "Tikri Border": 1765.43,
      "Bahadurgarh City": 1432.10
  },
  "Bahadurgarh City": {
      "Pandit Shree Ram Sharma": 1432.10,
      "Brigadier Hoshiyar Singh": 1543.21
  },
  "Brigadier Hoshiyar Singh": {
      "Bahadurgarh City": 1543.21,
      "Tikri Border": 1765.43
  },
  // Red Line (West section)
  "Shastri Nagar": {
      "Inderlok": 1354.32,
      "Pratap Nagar": 1243.21
  },
  "Pratap Nagar": {
      "Shastri Nagar": 1243.21,
      "Pul Bangash": 1132.10
  },
  "Pul Bangash": {
      "Pratap Nagar": 1132.10,
      "Tis Hazari": 1087.65
  },
  "Tis Hazari": {
      "Pul Bangash": 1087.65,
      "Kashmere Gate": 1543.21
  },
   // Red Line (North section)
  "Kanhaiya Nagar": {
      "Inderlok": 1132.10, // Corrected Direction check
      "Keshav Puram": 1243.21
  },
  "Keshav Puram": {
      "Kanhaiya Nagar": 1243.21,
      "Netaji Subhash Place": 1132.10 // Interchange Red/Pink
  },
  "Netaji Subhash Place": { // Interchange Red/Pink
      "Keshav Puram": 1132.10, // Red Line
      "Kohat Enclave": 1243.21, // Red Line
      "Shalimar Bagh": 1543.21, // Pink Line
      "Shakurpur": 1432.10 // Pink Line
  },
   "Kohat Enclave": {
      "Netaji Subhash Place": 1243.21,
      "Pitampura": 1132.10
  },
  "Pitampura": {
      "Kohat Enclave": 1132.10,
      "Rohini East": 1354.32
  },
  "Rohini East": {
      "Pitampura": 1354.32,
      "Rohini West": 1243.21
  },
  "Rohini West": {
      "Rohini East": 1243.21,
      "Rithala": 1543.21
  },
  "Rithala": {
      "Rohini West": 1543.21
  },
  // Pink Line (North West section)
   "Majlis Park": {
      "Azadpur": 1543.21
  },
  "Azadpur": { // Interchange Pink/Yellow
      "Majlis Park": 1543.21, // Pink Line
      "Shalimar Bagh": 1354.32, // Pink Line
      "Model Town": 1432.10, // Yellow Line
      "Adarsh Nagar": 1300.1 // Yellow Line (Corrected)
  },
  "Shalimar Bagh": {
      "Azadpur": 1354.32,
      "Netaji Subhash Place": 1543.21
  },
   "Shakurpur": {
      "Netaji Subhash Place": 1432.10,
      "Punjabi Bagh West": 1543.21 // Note: Interchange needed with Green line nearby
  },
  "Punjabi Bagh West": { // Pink Line Station (Near Green Line's Punjabi Bagh)
      "Shakurpur": 1543.21,
      "ESI Hospital": 1243.21
  },
  "ESI Hospital": {
      "Punjabi Bagh West": 1243.21,
      "Rajouri Garden": 1432.10
  },
  // Rapid Metro (Simplified Linear Representation)
  "Phase 1 (Rapid Metro)": {
      "Sikanderpur (Rapid Metro)": 987.65,
      "Belvedere Towers (Rapid Metro)": 876.54
  },
  "Belvedere Towers (Rapid Metro)": {
      "Phase 1 (Rapid Metro)": 876.54,
      "Cyber City (Rapid Metro)": 987.65
  },
  "Cyber City (Rapid Metro)": {
      "Belvedere Towers (Rapid Metro)": 987.65,
      "Moulsari Avenue (Rapid Metro)": 1132.10
  },
  "Moulsari Avenue (Rapid Metro)": {
      "Cyber City (Rapid Metro)": 1132.10,
      "Phase 3 (Rapid Metro)": 1243.21
  },
  "Phase 3 (Rapid Metro)": {
      "Moulsari Avenue (Rapid Metro)": 1243.21,
      "Sector 42-43 (Rapid Metro)": 1710.8 // Corrected
  },
  "Sector 42-43 (Rapid Metro)": {
      "Phase 3 (Rapid Metro)": 1710.8,
      "Sector 53-54 (Rapid Metro)": 1720.9
  },
  "Sector 53-54 (Rapid Metro)": {
      "Sector 42-43 (Rapid Metro)": 1720.9,
      "Sector 54 Chowk (Rapid Metro)": 1132.10
  },
  "Sector 54 Chowk (Rapid Metro)": {
      "Sector 53-54 (Rapid Metro)": 1132.10,
      "Sector 55-56 (Rapid Metro)": 987.65
  },
  "Sector 55-56 (Rapid Metro)": {
      "Sector 54 Chowk (Rapid Metro)": 987.65
  }
}


let colorLines = {
  //Red Line
  "Dilshad Garden": "#CC0000",
  "Jhilmil": "#CC0000",
  "Mansrover Park": "#CC0000", //Added/Corrected Name
  "Shahdara": "#CC0000",
  "Seelampur": "#CC0000", //Added/Corrected Name
  "Shastri Park": "#CC0000",
  "Tis Hazari": "#CC0000",
  "Pul Bangash": "#CC0000", //Corrected Name
  "Pratap Nagar": "#CC0000",
  "Shastri Nagar": "#CC0000",
  "Kanhaiya Nagar": "#CC0000",
  "Keshav Puram": "#CC0000",
  "Kohat Enclave": "#CC0000",
  "Pitampura": "#CC0000",
  "Rohini East": "#CC0000",
  "Rohini West": "#CC0000",
  "Rithala": "#CC0000",

  //Blue Line (Vaishali Branch)
  "Vaishali": "#0000FF",
  "Kaushambi": "#0000FF",
  "Preet Vihar": "#0000FF",
  "Nirman Vihar": "#0000FF",
  "Laxmi Nagar": "#0000FF",

  //Blue Line (Noida Branch)
  "Noida Electronic City": "#0000FF", //In graph, add if missing
  "Noida Sector 62": "#0000FF", //In graph, add if missing
  "Noida Sector 59": "#0000FF", //In graph, add if missing
  "Noida Sector 61": "#0000FF", //In graph, add if missing
  "Noida Sector 52": "#0000FF", //In graph, add if missing
  "Noida Sector 34": "#0000FF", //In graph, add if missing
  "Wave City Center Noida": "#0000FF", //Corrected Name (Wave City Center)
  "Golf Course": "#0000FF",
  "Noida Sector 18": "#0000FF", //Corrected Name
  "Noida Sector 16": "#0000FF", //Corrected Name
  "Noida Sector 15": "#0000FF", //Corrected Name
  "New Ashok Nagar": "#0000FF",
  "Mayur Vihar Extension": "#0000FF", //Corrected Name
  "Akshardham": "#0000FF",

  //Blue Line (Main)
  "Indraprastha": "#0000FF",
  "Supreme Court": "#0000FF", //Corrected Name
  "Barakhamba": "#0000FF",
  "R K Ashram Marg": "#0000FF", //Corrected Name
  "Jhandewalan": "#0000FF",
  "Karol Bagh": "#0000FF",
  "Rajendra Place": "#0000FF", //Added
  "Patel Nagar": "#0000FF",
  "Shadipur": "#0000FF",
  "Moti Nagar": "#0000FF",
  "Ramesh Nagar": "#0000FF",
  "Tagore Garden": "#0000FF",
  "Subhash Nagar": "#0000FF", //Updated name
  "Tilak Nagar": "#0000FF",
  "Janakpuri East": "#0000FF", //Corrected Name
  "Uttam Nagar East": "#0000FF",
  "Uttam Nagar West": "#0000FF",
  "Nawada": "#0000FF",
  "Dwarka Mor": "#0000FF",
  "Dwarka Sector - 14": "#0000FF", //Corrected Name
  "Dwarka Sector - 13": "#0000FF", //Corrected Name
  "Dwarka Sector - 12": "#0000FF", //Corrected Name
  "Dwarka Sector - 11": "#0000FF", //Corrected Name
  "Dwarka Sector - 10": "#0000FF", //Corrected Name
  "Dwarka Sector - 9": "#0000FF", //Corrected Name
  "Dwarka Sector - 8": "#0000FF", //Corrected Name

  //Green Line
  "Brigadier Hoshiyar Singh": "#008000", //Updated name
  "Bahadurgarh City": "#008000", //In graph, add if missing
  "Pandit Shree Ram Sharma": "#008000", //In graph, add if missing
  "Tikri Border": "#008000", //In graph, add if missing
  "Tikri Kalan": "#008000", //In graph, add if missing
  "Ghevra Metro Station": "#008000", //Updated name
  "Mundka Industrial Area": "#008000", //Added/Corrected Name
  "Mundka": "#008000",
  "Rajdhani Park": "#008000",
  "Nangloi Railway Station": "#008000",
  "Nangloi": "#008000",
  "Surajmal Stadium": "#008000", //Corrected Name
  "Udyog Nagar": "#008000",
  "Peera Garhi": "#008000",
  "Paschim Vihar (West)": "#008000", //Updated name format
  "Paschim Vihar (East)": "#008000", //Updated name format
  "Madipur": "#008000",
  "Shivaji Park": "#008000",
  "Punjabi Bagh": "#008000",
  "Satguru Ram Singh Marg": "#008000",

  //Yellow Line
  "Samaypur Badli": "#F7D117",
  "Haiderpur Badli Mor": "#F7D117",
  "Jahangirpuri": "#F7D117",
  "Adarsh Nagar": "#F7D117",
  "Model Town": "#F7D117",
  "GTB Nagar": "#F7D117", //Corrected Name
  "Vishwavidyalaya": "#F7D117",
  "Vidhan Sabha": "#F7D117",
  "Civil Lines": "#F7D117",
  "Chandni Chowk": "#F7D117",
  "Chawri Bazar": "#F7D117",
  "Patel Chowk": "#F7D117",
  "Udyog Bhawan": "#F7D117",
  "Lok Kalyan Marg": "#F7D117",
  "Jorbagh": "#F7D117",
  "AIIMS": "#F7D117",
  "Green Park": "#F7D117",
  "Malviya Nagar": "#F7D117",
  "Saket": "#F7D117",
  "Qutab Minar": "#F7D117",
  "Chhattarpur": "#F7D117",
  "Sultanpur": "#F7D117",
  "Ghitorni": "#F7D117",
  "Arjan Garh": "#F7D117",
  "Gurudronacharya": "#F7D117",
  "M G Road": "#F7D117",
  "IFFCO Chowk": "#F7D117",
  "Millennium City Centre Gurugram": "#F7D117", //Corrected Name

  //Violet Line
  "Lal Quila": "#8F00FF", //In graph, add if missing
  "Jama Masjid": "#8F00FF", //In graph, add if missing
  "Delhi Gate": "#8F00FF", //Added
  "ITO": "#8F00FF",
  "Janpath": "#8F00FF",
  "Khan Market": "#8F00FF",
  "JLN Stadium": "#8F00FF", //Corrected Name
  "Jangpura": "#8F00FF",
  "Moolchand": "#8F00FF",
  "Kailash Colony": "#8F00FF",
  "Nehru Place": "#8F00FF",
  "Govind Puri": "#8F00FF",
  "Jasola Apollo": "#8F00FF", //Corrected Name
  "Sarita Vihar": "#8F00FF",
  "Mohan Estate": "#8F00FF",
  "Tughlakabad": "#8F00FF", //Corrected Name
  "Badarpur Border": "#8F00FF", //Added/Corrected Name
  "Sarai": "#8F00FF",
  "NHPC Chowk": "#8F00FF",
  "Mewala Maharajpur": "#8F00FF",
  "Sector 28": "#8F00FF", //Updated name format
  "Raja Nahar Singh": "#8F00FF", //Updated name

  //Pink Line
  "Majlis Park": "#FF69B4",
  "Shalimar Bagh": "#FF69B4",
  "Shakurpur": "#FF69B4",
  "ESI Hospital": "#FF69B4", //Corrected Name
  "Mayapuri": "#FF69B4",
  "Naraina Vihar": "#FF69B4",
  "Delhi Cantt.": "#FF69B4", //Corrected Name
  "Sir Vishweshwaraiah Moti Bagh": "#FF69B4",
  "Bhikaji Cama Place": "#FF69B4",
  "Sarojini Nagar": "#FF69B4",
  "South Extension": "#FF69B4",
  "Vinobapuri": "#FF69B4", //In graph, add if missing
  "Ashram": "#FF69B4", //In graph, add if missing
  "Sarai Kale Khan": "#FF69B4", //In graph, add if missing
  "Hazrat Nizamuddin": "#FF69B4", //In graph, add if missing
  "Mayur Vihar Pocket 1": "#FF69B4", //Added
  "Trilokpuri Sanjay Lake": "#FF69B4",
  "East Vinod Nagar - Mayur Vihar Phase 2": "#FF69B4", //Updated name
  "Mandawali - West Vinod Nagar": "#FF69B4", //Corrected Name
  "IP Extension": "#FF69B4",
  "Karkarduma Court": "#FF69B4",
  "Krishna Nagar": "#FF69B4",
  "East Azad Nagar": "#FF69B4",
  "Jaffrabad": "#FF69B4", //Added/Corrected Name
  "Maujpur - Babarpur": "#FF69B4", //Added/Corrected Name
  "Gokulpuri": "#FF69B4",
  "Johri Enclave": "#FF69B4",
  "Shiv Vihar": "#FF69B4",

  //Magenta Line
  "Okhla Bird Sanctuary": "#800080",
  "Kalindi Kunj": "#800080",
  "Jasola Vihar Shaheen Bagh": "#800080", //Added
  "Okhla Vihar": "#800080", //Added
  "Jamia Millia Islamia": "#800080",
  "Sukhdev Vihar": "#800080",
  "Okhla NSIC": "#800080",
  "Nehru Enclave": "#800080", //Found in graph, added
  "Greater Kailash": "#800080", //Found in graph, added
  "Chirag Delhi": "#800080", //Found in graph, added
  "Panchsheel Park": "#800080", //Found in graph, added
  "IIT": "#800080", //Added/Corrected Name
  "M G Road": "#800080", //Added/Corrected Name
  "Munirka": "#800080", //Found in graph, added
  "Vasant Vihar": "#800080", //Found in graph, added
  "Shankar Vihar": "#800080", //Found in graph, added
  "Terminal 1 - IGI Airport": "#800080", //Added/Corrected Name
  "Sadar Bazar Cantonment": "#800080", //Updated name
  "Palam": "#800080", //Found in graph, added
  "Dashrath Puri": "#800080", //Found in graph, added
  "Dabri Mor - Janakpuri South": "#800080", //Added/Corrected Name

  //Grey Line
  "Nangli": "#808080",
  "Najafgarh": "#808080",
  "Dhansa Bus Stand": "#808080",

  //Airport Express Line (Orange)
  "New Delhi Station": "#FFA500", //Use New Delhi only? Let's stick to graph name: New Delhi
  "Delhi Aerocity": "#FFA500",
  "Shivaji Stadium": "#FFA500",

  //Rapid Metro (Assigned #00AEEF)
  "Phase 1 (Rapid Metro)": "#00AEEF", //Updated name format
  "Belvedere Towers (Rapid Metro)": "#00AEEF", //Added
  "Cyber City (Rapid Metro)": "#00AEEF", //Added
  "Moulsari Avenue (Rapid Metro)": "#00AEEF", //Added
  "Phase 3 (Rapid Metro)": "#00AEEF", //Added
  "Sector 42-43 (Rapid Metro)": "#00AEEF", //Added/Corrected Name
  "Sector 53-54 (Rapid Metro)": "#00AEEF", //Added/Corrected Name
  "Sector 54 Chowk (Rapid Metro)": "#00AEEF", //Added/Corrected Name
  "Sector 55-56 (Rapid Metro)": "#00AEEF", //Added/Corrected Name

  //Interchanges
  "Kashmere Gate": "interchange",
  "Welcome": "interchange", //Updated
  "Inderlok": "interchange",
  "Anand Vihar ISBT": "interchange", //Corrected Name
  "Karkarduma": "interchange",
  "Yamuna Bank": "interchange",
  "Mandi House": "interchange",
  "Rajiv Chowk": "interchange",
  "Kirti Nagar": "interchange",
  "Rajouri Garden": "interchange",
  "Janakpuri West": "interchange", //Corrected Name
  "Dwarka": "interchange", //Updated
  "Dwarka Sector - 21": "interchange",
  "Ashok Park Main": "interchange",
  "Azadpur": "interchange",
  "New Delhi": "interchange", //Updated Name Consistency
  "Central Secretariat": "interchange",
  "Dilli Haat - INA": "interchange",
  "Hauz Khas": "interchange",
  "Sikanderpur (Rapid Metro)": "interchange",
  "Lajpat Nagar": "interchange",
  "Kalkaji Mandir": "interchange",
  "Netaji Subhash Place": "interchange", //Updated
  "Botanical Garden": "interchange",
  "Mayur Vihar Phase 1": "interchange", //Updated/Corrected Name
  "Punjabi Bagh West": "interchange", //Assuming interchange intent
  "Durgabai Deshmukh South Campus": "interchange",
  "Dhaula Kuan": "interchange",
  "IGI Airport": "interchange" //Updated
}


export { graph, colorLines };