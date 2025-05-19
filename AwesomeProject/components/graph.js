let graph = {
  'Dilshad Garden': {
    Jhilmil: 893.31,
  },
  Jhilmil: {
    'Dilshad Garden': 893.31,
    'Mansrover Park': 1096.67,
  },
  'Mansrover Park': {
    Jhilmil: 1096.67,
    Shahdara: 1247.52,
  },
  Shahdara: {
    'Mansrover Park': 1247.52,
    Welcome: 1123.45,
  },
  Welcome: {
    Shahdara: 1123.45,
    Seelampur: 1352.87,
    'East Azad Nagar': 1243.21,
    Jaffrabad: 1410.7,
  },
  Seelampur: {
    Welcome: 1352.87,
    'Shastri Park': 1475.32,
  },
  'Shastri Park': {
    Seelampur: 1475.32,
    'Kashmere Gate': 2217.64,
  },
  'Kashmere Gate': {
    'Shastri Park': 2217.64,
    'Tis Hazari': 1543.21,
    'Civil Lines': 1687.54,
    'Chandni Chowk': 1456.78,
    'Lal Quila': 1243.56,
  },
  'Chandni Chowk': {
    'Kashmere Gate': 1456.78,
    'Chawri Bazar': 1023.45,
  },
  'Chawri Bazar': {
    'Chandni Chowk': 1023.45,
    'New Delhi': 1198.76,
  },
  'New Delhi': {
    'Chawri Bazar': 1198.76,
    'Rajiv Chowk': 876.54,
    'Shivaji Stadium': 2134.67,
  },
  'Rajiv Chowk': {
    'New Delhi': 876.54,
    'Patel Chowk': 1321.43,
    Barakhamba: 945.78,
    'R K Ashram Marg': 1400.2,
  },
  'Patel Chowk': {
    'Rajiv Chowk': 1321.43,
    'Central Secretariat': 864.32,
  },
  'Central Secretariat': {
    'Patel Chowk': 864.32,
    'Udyog Bhawan': 765.43,
    'Khan Market': 1654.32,
    Janpath: 1132.87,
  },
  'Udyog Bhawan': {
    'Central Secretariat': 765.43,
    'Lok Kalyan Marg': 1543.21,
  },
  'Lok Kalyan Marg': {
    'Udyog Bhawan': 1543.21,
    Jorbagh: 1234.56,
  },
  Jorbagh: {
    'Lok Kalyan Marg': 1234.56,
    'Dilli Haat - INA': 1432.1,
  },
  'Dilli Haat - INA': {
    Jorbagh: 1432.1,
    AIIMS: 987.65,
    'Sarojini Nagar': 1243.76,
    'South Extension': 1176.43,
  },
  AIIMS: {
    'Dilli Haat - INA': 987.65,
    'Green Park': 1165.43,
  },
  'Green Park': {
    AIIMS: 1165.43,
    'Hauz Khas': 1387.65,
  },
  'Hauz Khas': {
    'Green Park': 1387.65,
    'Malviya Nagar': 1243.21,
    'IIT Delhi': 1765.43,
    'R.K. Puram': 1532.76,
  },
  'Malviya Nagar': {
    'Hauz Khas': 1243.21,
    Saket: 1387.65,
  },
  Saket: {
    'Malviya Nagar': 1387.65,
    'Qutab Minar': 1498.76,
  },
  'Qutab Minar': {
    Saket: 1498.76,
    Chhattarpur: 1765.43,
  },
  Chhattarpur: {
    'Qutab Minar': 1765.43,
    Sultanpur: 1354.32,
  },
  Sultanpur: {
    Chhattarpur: 1354.32,
    Ghitorni: 1876.54,
  },
  Ghitorni: {
    Sultanpur: 1876.54,
    'Arjan Garh': 1432.1,
  },
  'Arjan Garh': {
    Ghitorni: 1432.1,
    Gurudronacharya: 1565.43,
  },
  Gurudronacharya: {
    'Arjan Garh': 1565.43,
    'Sikanderpur (Rapid Metro)': 1287.65,
  },
  'Sikanderpur (Rapid Metro)': {
    Gurudronacharya: 1287.65,
    'M G Road': 1354.32,
    'Phase 1 (Rapid Metro)': 987.65,
  },
  'M G Road': {
    'Sikanderpur (Rapid Metro)': 1354.32,
    'IFFCO Chowk': 1765.43,
  },
  'IFFCO Chowk': {
    'M G Road': 1765.43,
    'Millennium City Centre Gurugram': 2165.43,
  },
  'Millennium City Centre Gurugram': {
    'IFFCO Chowk': 2165.43,
  },
  'Civil Lines': {
    'Kashmere Gate': 1687.54,
    'Vidhan Sabha': 1243.21,
  },
  'Vidhan Sabha': {
    'Civil Lines': 1243.21,
    Vishwavidyalaya: 986.54,
  },
  Vishwavidyalaya: {
    'Vidhan Sabha': 986.54,
    'GTB Nagar': 1176.54,
  },
  'GTB Nagar': {
    Vishwavidyalaya: 1176.54,
    'Model Town': 1243.21,
  },
  'Model Town': {
    'GTB Nagar': 1243.21,
    Azadpur: 1432.1,
  },
  'Adarsh Nagar': {
    Azadpur: 1300.1,
    Jahangirpuri: 1398.76,
  },
  Jahangirpuri: {
    'Adarsh Nagar': 1398.76,
    'Haiderpur Badli Mor': 1765.43,
  },
  'Haiderpur Badli Mor': {
    Jahangirpuri: 1765.43,
    'Samaypur Badli': 1932.1,
  },
  'Samaypur Badli': {
    'Haiderpur Badli Mor': 1932.1,
  },
  Barakhamba: {
    'Rajiv Chowk': 945.78,
    'Mandi House': 1132.1,
  },
  'Mandi House': {
    Barakhamba: 1132.1,
    'Supreme Court': 1243.21,
    Janpath: 1087.65,
    ITO: 1132.1,
  },
  Janpath: {
    'Mandi House': 1087.65,
    'Central Secretariat': 1132.87,
    'Khan Market': 1243.21,
  },
  'Khan Market': {
    'Central Secretariat': 1654.32,
    'JLN Stadium': 1765.43,
  },
  'JLN Stadium': {
    'Khan Market': 1765.43,
    Jangpura: 1398.76,
  },
  Jangpura: {
    'JLN Stadium': 1398.76,
    'Lajpat Nagar': 1554.32,
  },
  'Lajpat Nagar': {
    Jangpura: 1554.32,
    Moolchand: 1243.21,
    Vinobapuri: 1432.1,
    'South Extension': 1321.54,
  },
  Moolchand: {
    'Lajpat Nagar': 1243.21,
    'Kailash Colony': 1354.32,
  },
  'Kailash Colony': {
    Moolchand: 1354.32,
    'Nehru Place': 1176.54,
  },
  'Nehru Place': {
    'Kailash Colony': 1176.54,
    'Kalkaji Mandir': 1432.1,
  },
  'Kalkaji Mandir': {
    'Nehru Place': 1432.1,
    'Govind Puri': 1265.43,
    'Nehru Enclave': 1432.1,
    'Okhla NSIC': 1654.32,
  },
  'Govind Puri': {
    'Kalkaji Mandir': 1265.43,
    'Jasola Apollo': 1487.65,
  },
  'Jasola Apollo': {
    'Govind Puri': 1487.65,
    'Sarita Vihar': 1798.76,
  },
  'Sarita Vihar': {
    'Jasola Apollo': 1798.76,
    'Mohan Estate': 1543.21,
  },
  'Mohan Estate': {
    'Sarita Vihar': 1543.21,
    Tughlakabad: 1687.65,
  },
  Tughlakabad: {
    'Mohan Estate': 1687.65,
    'Badarpur Border': 1765.43,
  },
  'Badarpur Border': {
    Tughlakabad: 1765.43,
    Sarai: 1432.1,
  },
  Sarai: {
    'Badarpur Border': 1432.1,
    'NHPC Chowk': 1654.32,
  },
  'NHPC Chowk': {
    Sarai: 1654.32,
    'Mewala Maharajpur': 1487.65,
  },
  'Mewala Maharajpur': {
    'NHPC Chowk': 1487.65,
    'Sector 28': 1354.32,
  },
  'Sector 28': {
    'Mewala Maharajpur': 1354.32,
    'Raja Nahar Singh': 1876.54,
  },
  'Raja Nahar Singh': {
    'Sector 28': 1876.54,
    'Escorts Mujesar': 1876.54,
  },
  'Supreme Court': {
    'Mandi House': 1243.21,
    Indraprastha: 1400.5,
  },
  Indraprastha: {
    'Supreme Court': 1400.5,
    'Yamuna Bank': 2176.54,
  },
  'Yamuna Bank': {
    Indraprastha: 2176.54,
    Akshardham: 1765.43,
    'Laxmi Nagar': 1354.32,
  },
  Akshardham: {
    'Yamuna Bank': 1765.43,
    'Mayur Vihar Phase 1': 2098.76,
  },
  'Mayur Vihar Phase 1': {
    Akshardham: 2098.76,
    'Mayur Vihar Extension': 1187.65,
    'Hazrat Nizamuddin': 2187.65,
    'Mayur Vihar Pocket 1': 1310.1,
  },
  'Mayur Vihar Extension': {
    'Mayur Vihar Phase 1': 1187.65,
    'New Ashok Nagar': 1354.32,
  },
  'New Ashok Nagar': {
    'Mayur Vihar Extension': 1354.32,
    'Noida Sector 15': 1765.43,
  },
  'Noida Sector 15': {
    'New Ashok Nagar': 1765.43,
    'Noida Sector 16': 1243.21,
  },
  'Noida Sector 16': {
    'Noida Sector 15': 1243.21,
    'Noida Sector 18': 1432.1,
  },
  'Noida Sector 18': {
    'Noida Sector 16': 1432.1,
    'Botanical Garden': 1543.21,
  },
  'Botanical Garden': {
    'Noida Sector 18': 1543.21,
    'Golf Course': 1354.32,
    'Okhla Bird Sanctuary': 1550.6,
    'Kalindi Kunj': 2176.54,
  },
  'Golf Course': {
    'Botanical Garden': 1354.32,
    'Wave City Center Noida': 1632.1,
  },
  'Wave City Center Noida': {
    'Golf Course': 1632.1,
    'Noida Sector 34': 1432.1,
  },
  'Noida Sector 34': {
    'Wave City Center Noida': 1432.1,
    'Noida Sector 52': 1765.43,
  },
  'Noida Sector 52': {
    'Noida Sector 34': 1765.43,
    'Noida Sector 61': 1243.21,
  },
  'Noida Sector 61': {
    'Noida Sector 52': 1243.21,
    'Noida Sector 59': 1132.1,
  },
  'Noida Sector 59': {
    'Noida Sector 61': 1132.1,
    'Noida Sector 62': 1265.43,
  },
  'Noida Sector 62': {
    'Noida Sector 59': 1265.43,
    'Noida Electronic City': 1543.21,
  },
  'Noida Electronic City': {
    'Noida Sector 62': 1543.21,
  },
  'Laxmi Nagar': {
    'Yamuna Bank': 1354.32,
    'Nirman Vihar': 1243.21,
  },
  'Nirman Vihar': {
    'Laxmi Nagar': 1243.21,
    'Preet Vihar': 1132.1,
  },
  'Preet Vihar': {
    'Nirman Vihar': 1132.1,
    Karkarduma: 1354.32,
  },
  Karkarduma: {
    'Preet Vihar': 1354.32,
    'Anand Vihar ISBT': 1765.43,
    'Karkarduma Court': 1243.21,
  },
  'Anand Vihar ISBT': {
    Karkarduma: 1765.43,
    Kaushambi: 1354.32,
    'IP Extension': 1360.6,
  },
  Kaushambi: {
    'Anand Vihar ISBT': 1354.32,
    Vaishali: 1543.21,
  },
  Vaishali: {
    Kaushambi: 1543.21,
  },
  'Karkarduma Court': {
    Karkarduma: 1243.21,
    'Krishna Nagar': 1132.1,
  },
  'Krishna Nagar': {
    'Karkarduma Court': 1132.1,
    'East Azad Nagar': 1087.65,
  },
  'East Azad Nagar': {
    'Krishna Nagar': 1087.65,
    Welcome: 1243.21,
  },
  Jhandewalan: {
    'R K Ashram Marg': 1354.32,
    'Karol Bagh': 1132.1,
  },
  'Karol Bagh': {
    Jhandewalan: 1132.1,
    'Rajendra Place': 1100.4,
  },
  'Rajendra Place': {
    'Karol Bagh': 1100.4,
    'Patel Nagar': 1200.3,
  },
  'Patel Nagar': {
    'Rajendra Place': 1200.3,
    Shadipur: 1243.21,
  },
  'R K Ashram Marg': {
    Jhandewalan: 1354.32,
    'Rajiv Chowk': 1432.1,
  },
  Shadipur: {
    'Patel Nagar': 1243.21,
    'Kirti Nagar': 1354.32,
  },
  'Kirti Nagar': {
    Shadipur: 1354.32,
    'Moti Nagar': 1132.1,
    'Satguru Ram Singh Marg': 1243.21,
  },
  'Moti Nagar': {
    'Kirti Nagar': 1132.1,
    'Ramesh Nagar': 1087.65,
  },
  'Ramesh Nagar': {
    'Moti Nagar': 1087.65,
    'Rajouri Garden': 1354.32,
  },
  'Rajouri Garden': {
    'Ramesh Nagar': 1354.32,
    'Tagore Garden': 1243.21,
    'ESI Hospital': 1432.1,
    Mayapuri: 1432.1,
  },
  'Tagore Garden': {
    'Rajouri Garden': 1243.21,
    'Subhash Nagar': 1132.1,
  },
  'Subhash Nagar': {
    'Tagore Garden': 1132.1,
    'Tilak Nagar': 1087.65,
  },
  'Tilak Nagar': {
    'Subhash Nagar': 1087.65,
    'Janakpuri East': 1354.32,
  },
  'Janakpuri East': {
    'Tilak Nagar': 1354.32,
    'Janakpuri West': 1243.21,
  },
  'Janakpuri West': {
    'Janakpuri East': 1243.21,
    'Uttam Nagar East': 1432.1,
    'Dabri Mor - Janakpuri South': 1876.54,
  },
  'Uttam Nagar East': {
    'Janakpuri West': 1432.1,
    'Uttam Nagar West': 1087.65,
  },
  'Uttam Nagar West': {
    'Uttam Nagar East': 1087.65,
    Nawada: 1354.32,
  },
  Nawada: {
    'Uttam Nagar West': 1354.32,
    'Dwarka Mor': 1543.21,
  },
  'Dwarka Mor': {
    Nawada: 1543.21,
    Dwarka: 1765.43,
  },
  Dwarka: {
    'Dwarka Mor': 1765.43,
    'Dwarka Sector - 14': 1243.21,
    Nangli: 1610.7,
  },
  'Dwarka Sector - 14': {
    Dwarka: 1243.21,
    'Dwarka Sector - 13': 1132.1,
  },
  'Dwarka Sector - 13': {
    'Dwarka Sector - 14': 1132.1,
    'Dwarka Sector - 12': 1087.65,
  },
  'Dwarka Sector - 12': {
    'Dwarka Sector - 13': 1087.65,
    'Dwarka Sector - 11': 1354.32,
  },
  'Dwarka Sector - 11': {
    'Dwarka Sector - 12': 1354.32,
    'Dwarka Sector - 10': 1243.21,
  },
  'Dwarka Sector - 10': {
    'Dwarka Sector - 11': 1243.21,
    'Dwarka Sector - 9': 1132.1,
  },
  'Dwarka Sector - 9': {
    'Dwarka Sector - 10': 1132.1,
    'Dwarka Sector - 8': 1087.65,
  },
  'Dwarka Sector - 8': {
    'Dwarka Sector - 9': 1087.65,
    'Dwarka Sector - 21': 1543.21,
  },
  'Dwarka Sector - 21': {
    'Dwarka Sector - 8': 1543.21,
    'New Delhi': 3432.1,
  },
  Nangli: {
    Dwarka: 1610.7,
    Najafgarh: 1876.54,
  },
  Najafgarh: {
    Nangli: 1876.54,
    'Dhansa Bus Stand': 1243.21,
  },
  'Dhansa Bus Stand': {
    Najafgarh: 1243.21,
  },
  'Shivaji Stadium': {
    'New Delhi': 2134.67,
    'Dhaula Kuan': 2765.43,
  },
  'Dhaula Kuan': {
    'Shivaji Stadium': 2765.43,
    'Delhi Aerocity': 3187.65,
    'Durgabai Deshmukh South Campus': 1643.21,
  },
  'Delhi Aerocity': {
    'Dhaula Kuan': 3187.65,
    'IGI Airport': 2876.54,
  },
  'IGI Airport': {
    'Delhi Aerocity': 2876.54,
    'Dwarka Sector - 21': 3432.1,
  },
  'Lal Quila': {
    'Kashmere Gate': 1243.56,
    'Jama Masjid': 1087.65,
  },
  'Jama Masjid': {
    'Lal Quila': 1087.65,
    'Delhi Gate': 1354.32,
  },
  'Delhi Gate': {
    'Jama Masjid': 1354.32,
    ITO: 1243.21,
  },
  ITO: {
    'Delhi Gate': 1243.21,
    'Mandi House': 1132.1,
  },
  Mayapuri: {
    'Rajouri Garden': 1432.1,
    'Naraina Vihar': 1354.32,
  },
  'Naraina Vihar': {
    Mayapuri: 1354.32,
    'Delhi Cantt.': 1765.43,
  },
  'Delhi Cantt.': {
    'Naraina Vihar': 1765.43,
    'Durgabai Deshmukh South Campus': 1543.21,
  },
  'Durgabai Deshmukh South Campus': {
    'Delhi Cantt.': 1543.21,
    'Sir Vishweshwaraiah Moti Bagh': 1354.32,
    'Dhaula Kuan': 1643.21,
  },
  'Sir Vishweshwaraiah Moti Bagh': {
    'Durgabai Deshmukh South Campus': 1354.32,
    'Bhikaji Cama Place': 1432.1,
  },
  'Bhikaji Cama Place': {
    'Sir Vishweshwaraiah Moti Bagh': 1432.1,
    'Sarojini Nagar': 1243.21,
  },
  'Sarojini Nagar': {
    'Bhikaji Cama Place': 1243.21,
    'Dilli Haat - INA': 1243.76,
  },
  'South Extension': {
    'Dilli Haat - INA': 1176.43,
    'Lajpat Nagar': 1321.54,
  },
  Vinobapuri: {
    'Lajpat Nagar': 1432.1,
    Ashram: 1243.21,
  },
  Ashram: {
    Vinobapuri: 1243.21,
    'Sarai Kale Khan': 1432.1,
  },
  'Sarai Kale Khan': {
    Ashram: 1432.1,
    'Mayur Vihar Phase 1': 2187.65,
  },
  'Mayur Vihar Pocket 1': {
    'Mayur Vihar Phase 1': 1310.1,
    'Trilokpuri Sanjay Lake': 1320.2,
  },
  'Trilokpuri Sanjay Lake': {
    'Mayur Vihar Pocket 1': 1320.2,
    'East Vinod Nagar - Mayur Vihar Phase 2': 1330.3,
  },
  'East Vinod Nagar - Mayur Vihar Phase 2': {
    'Mayur Vihar Pocket 1': 1330.3,
    'Mandawali - West Vinod Nagar': 1340.4,
  },
  'Mandawali - West Vinod Nagar': {
    'East Vinod Nagar - Mayur Vihar Phase 2': 1340.4,
    'IP Extension': 1350.5,
  },
  'IP Extension': {
    'Mandawali - West Vinod Nagar': 1350.5,
    'Anand Vihar ISBT': 1360.6,
  },
  Jaffrabad: {
    Welcome: 1410.7,
    'Maujpur - Babarpur': 1420.8,
  },
  'Maujpur - Babarpur': {
    Jaffrabad: 1420.8,
    Gokulpuri: 1430.9,
  },
  Gokulpuri: {
    'Maujpur - Babarpur': 1430.9,
    'Johri Enclave': 1440.0,
  },
  'Johri Enclave': {
    Gokulpuri: 1440.0,
    'Shiv Vihar': 1450.1,
  },
  'Shiv Vihar': {
    'Johri Enclave': 1450.1,
  },
  IIT: {
    'Hauz Khas': 1765.43,
    'Panchsheel Park': 1354.32,
  },
  'Panchsheel Park': {
    IIT: 1354.32,
    'Chirag Delhi': 1243.21,
  },
  'Chirag Delhi': {
    'Panchsheel Park': 1243.21,
    'Greater Kailash': 1354.32,
  },
  'Greater Kailash': {
    'Chirag Delhi': 1354.32,
    'Nehru Enclave': 1243.21,
  },
  'Nehru Enclave': {
    'Greater Kailash': 1243.21,
    'Kalkaji Mandir': 1432.1,
  },
  'Okhla NSIC': {
    'Kalkaji Mandir': 1654.32,
    'Sukhdev Vihar': 1354.32,
  },
  'Sukhdev Vihar': {
    'Okhla NSIC': 1354.32,
    'Jamia Millia Islamia': 1243.21,
  },
  'Jamia Millia Islamia': {
    'Sukhdev Vihar': 1243.21,
    'Okhla Vihar': 1510.2,
  },
  'Okhla Vihar': {
    'Jamia Millia Islamia': 1510.2,
    'Jasola Vihar Shaheen Bagh': 1520.3,
  },
  'Jasola Vihar Shaheen Bagh': {
    'Okhla Vihar': 1520.3,
    'Kalindi Kunj': 1530.4,
  },
  'Kalindi Kunj': {
    'Jasola Vihar Shaheen Bagh': 1530.4,
    'Okhla Bird Sanctuary': 1354.32,
  },
  'Okhla Bird Sanctuary': {
    'Kalindi Kunj': 1354.32,
    'Botanical Garden': 1550.6,
  },
  'Dabri Mor - Janakpuri South': {
    'Janakpuri West': 1876.54,
    'Dashrath Puri': 1543.21,
  },
  'Dashrath Puri': {
    'Dabri Mor - Janakpuri South': 1543.21,
    Palam: 1432.1,
  },
  Palam: {
    'Dashrath Puri': 1432.1,
    'Sadar Bazar Cantonment': 1543.21,
  },
  'Sadar Bazar Cantonment': {
    'Terminal 1 - IGI Airport': 1543.21,
    Palam: 1765.43,
  },
  'Terminal 1 - IGI Airport': {
    'Shankar Vihar': 1876.54,
    'Sadar Bazar Cantonment': 2143.21,
  },
  'Shankar Vihar': {
    'Terminal 1 - IGI Airport': 2143.21,
    'Vasant Vihar': 1654.32,
  },
  'Vasant Vihar': {
    'Shankar Vihar': 1654.32,
    Munirka: 1243.21,
  },
  Munirka: {
    'Vasant Vihar': 1243.21,
    'M G Road': 1354.32,
  },
  'M G Road': {
    Munirka: 1354.32,
    'Hauz Khas': 1532.76,
  },
  'Satguru Ram Singh Marg': {
    'Kirti Nagar': 1243.21,
    'Ashok Park Main': 1450.6,
  },
  Inderlok: {
    'Ashok Park Main': 1243.21,
    'Shastri Nagar': 1354.32,
    'Kanhaiya Nagar': 1132.1,
  },
  'Ashok Park Main': {
    Inderlok: 1243.21,
    'Punjabi Bagh': 1543.21,
    'Satguru Ram Singh Marg': 1450.6,
  },
  'Punjabi Bagh': {
    'Ashok Park Main': 1543.21,
    'Shivaji Park': 1243.21,
  },
  'Shivaji Park': {
    'Punjabi Bagh': 1243.21,
    Madipur: 1087.65,
  },
  Madipur: {
    'Shivaji Park': 1087.65,
    'Paschim Vihar (East)': 1354.32,
  },
  'Paschim Vihar (East)': {
    Madipur: 1354.32,
    'Paschim Vihar (West)': 1243.21,
  },
  'Paschim Vihar (West)': {
    'Paschim Vihar (East)': 1243.21,
    'Peera Garhi': 1432.1,
  },
  'Peera Garhi': {
    'Paschim Vihar (West)': 1432.1,
    'Udyog Nagar': 1243.21,
  },
  'Udyog Nagar': {
    'Peera Garhi': 1243.21,
    'Surajmal Stadium': 1354.32,
  },
  'Surajmal Stadium': {
    'Udyog Nagar': 1354.32,
    Nangloi: 1243.21,
  },
  Nangloi: {
    'Surajmal Stadium': 1243.21,
    'Nangloi Railway Station': 1087.65,
  },
  'Nangloi Railway Station': {
    Nangloi: 1087.65,
    'Rajdhani Park': 1354.32,
  },
  'Rajdhani Park': {
    'Nangloi Railway Station': 1354.32,
    Mundka: 1543.21,
  },
  Mundka: {
    'Rajdhani Park': 1543.21,
    'Mundka Industrial Area': 1243.21,
  },
  'Mundka Industrial Area': {
    Mundka: 1243.21,
    'Ghevra Metro Station': 1432.1,
  },
  'Ghevra Metro Station': {
    'Mundka Industrial Area': 1432.1,
    Mundka: 1654.32,
  },
  'Tikri Kalan': {
    'Ghevra Metro Station': 1654.32,
    'Tikri Border': 1243.21,
  },
  'Tikri Border': {
    'Tikri Kalan': 1243.21,
    'Pandit Shree Ram Sharma': 1765.43,
  },
  'Pandit Shree Ram Sharma': {
    'Tikri Border': 1765.43,
    'Bahadurgarh City': 1432.1,
  },
  'Bahadurgarh City': {
    'Pandit Shree Ram Sharma': 1432.1,
    'Brigadier Hoshiyar Singh': 1543.21,
  },
  'Brigadier Hoshiyar Singh': {
    'Bahadurgarh City': 1543.21,
    'Tikri Border': 1765.43,
  },
  'Shastri Nagar': {
    Inderlok: 1354.32,
    'Pratap Nagar': 1243.21,
  },
  'Pratap Nagar': {
    'Shastri Nagar': 1243.21,
    'Pul Bangash': 1132.1,
  },
  'Pul Bangash': {
    'Pratap Nagar': 1132.1,
    'Tis Hazari': 1087.65,
  },
  'Tis Hazari': {
    'Pul Bangash': 1087.65,
    'Kashmere Gate': 1543.21,
  },
  'Kanhaiya Nagar': {
    Inderlok: 1132.1,
    'Keshav Puram': 1243.21,
  },
  'Keshav Puram': {
    'Kanhaiya Nagar': 1243.21,
    'Netaji Subhash Place': 1132.1,
  },
  'Netaji Subhash Place': {
    'Keshav Puram': 1132.1,
    'Kohat Enclave': 1243.21,
    'Shalimar Bagh': 1543.21,
    Shakurpur: 1432.1,
  },
  'Kohat Enclave': {
    'Netaji Subhash Place': 1243.21,
    Pitampura: 1132.1,
  },
  Pitampura: {
    'Kohat Enclave': 1132.1,
    'Rohini East': 1354.32,
  },
  'Rohini East': {
    Pitampura: 1354.32,
    'Rohini West': 1243.21,
  },
  'Rohini West': {
    'Rohini East': 1243.21,
    Rithala: 1543.21,
  },
  Rithala: {
    'Rohini West': 1543.21,
  },
  'Majlis Park': {
    Azadpur: 1543.21,
  },
  Azadpur: {
    'Majlis Park': 1543.21,
    'Shalimar Bagh': 1354.32,
    'Model Town': 1432.1,
    'Adarsh Nagar': 1300.1,
  },
  'Shalimar Bagh': {
    Azadpur: 1354.32,
    'Netaji Subhash Place': 1543.21,
  },
  Shakurpur: {
    'Netaji Subhash Place': 1432.1,
    'Punjabi Bagh West': 1543.21,
  },
  'Punjabi Bagh West': {
    Shakurpur: 1543.21,
    'ESI Hospital': 1243.21,
  },
  'ESI Hospital': {
    'Punjabi Bagh West': 1243.21,
    'Rajouri Garden': 1432.1,
  },
  'Phase 1 (Rapid Metro)': {
    'Sikanderpur (Rapid Metro)': 987.65,
    'Belvedere Towers (Rapid Metro)': 876.54,
  },
  'Belvedere Towers (Rapid Metro)': {
    'Phase 1 (Rapid Metro)': 876.54,
    'Cyber City (Rapid Metro)': 987.65,
  },
  'Cyber City (Rapid Metro)': {
    'Belvedere Towers (Rapid Metro)': 987.65,
    'Moulsari Avenue (Rapid Metro)': 1132.1,
  },
  'Moulsari Avenue (Rapid Metro)': {
    'Cyber City (Rapid Metro)': 1132.1,
    'Phase 3 (Rapid Metro)': 1243.21,
  },
  'Phase 3 (Rapid Metro)': {
    'Moulsari Avenue (Rapid Metro)': 1243.21,
    'Sector 42-43 (Rapid Metro)': 1710.8,
  },
  'Sector 42-43 (Rapid Metro)': {
    'Phase 3 (Rapid Metro)': 1710.8,
    'Sector 53-54 (Rapid Metro)': 1720.9,
  },
  'Sector 53-54 (Rapid Metro)': {
    'Sector 42-43 (Rapid Metro)': 1720.9,
    'Sector 54 Chowk (Rapid Metro)': 1132.1,
  },
  'Sector 54 Chowk (Rapid Metro)': {
    'Sector 53-54 (Rapid Metro)': 1132.1,
    'Sector 55-56 (Rapid Metro)': 987.65,
  },
  'Sector 55-56 (Rapid Metro)': {
    'Sector 54 Chowk (Rapid Metro)': 987.65,
  },
};

let graphWithIds = {
  1: {
    2: 893.31,
  },
  2: {
    1: 893.31,
    3: 1096.67,
  },
  3: {
    2: 1096.67,
    4: 1247.52,
  },
  4: {
    3: 1247.52,
    5: 1123.45,
  },
  5: {
    4: 1123.45,
    6: 1352.87,
    213: 1243.21,
    214: 1410.7,
  },
  6: {
    5: 1352.87,
    7: 1475.32,
  },
  7: {
    6: 1475.32,
    8: 2217.64,
  },
  8: {
    7: 2217.64,
    9: 1543.21,
    46: 1687.54,
    47: 1456.78,
    160: 1243.56,
  },
  9: {
    8: 1543.21,
    10: 1087.65,
  },
  10: {
    9: 1087.65,
    11: 1132.1,
  },
  11: {
    10: 1132.1,
    12: 1243.21,
  },
  12: {
    11: 1243.21,
    13: 1354.32,
  },
  13: {
    12: 1354.32,
    14: 1132.1,
    34: 1243.21,
  },
  14: {
    13: 1132.1,
    15: 1243.21,
  },
  15: {
    14: 1243.21,
    16: 1132.1,
  },
  16: {
    15: 1132.1,
    17: 1243.21,
    174: 1543.21,
    175: 1432.1,
  },
  17: {
    16: 1243.21,
    18: 1132.1,
  },
  18: {
    17: 1132.1,
    19: 1354.32,
  },
  19: {
    18: 1354.32,
    20: 1243.21,
  },
  20: {
    19: 1243.21,
    21: 1543.21,
  },
  21: {
    20: 1543.21,
  },
  22: {
    23: 1543.21,
    196: 1243.21,
  },
  23: {
    22: 1543.21,
    24: 1354.32,
  },
  24: {
    23: 1354.32,
    25: 1087.65,
  },
  25: {
    24: 1087.65,
    26: 1243.21,
  },
  26: {
    25: 1243.21,
    27: 1354.32,
  },
  27: {
    26: 1354.32,
    28: 1243.21,
  },
  28: {
    27: 1243.21,
    29: 1432.1,
  },
  29: {
    28: 1432.1,
    30: 1243.21,
  },
  30: {
    29: 1243.21,
    31: 1354.32,
  },
  31: {
    30: 1354.32,
    32: 1087.65,
  },
  32: {
    31: 1087.65,
    33: 1243.21,
  },
  33: {
    32: 1243.21,
    34: 1543.21,
  },
  34: {
    13: 1243.21,
    33: 1543.21,
    35: 1450.6,
  },
  35: {
    34: 1450.6,
    100: 1243.21,
  },
  36: {
    38: 1932.1,
  },
  38: {
    36: 1932.1,
    39: 1765.43,
  },
  39: {
    38: 1765.43,
    40: 1398.76,
  },
  40: {
    39: 1398.76,
    41: 1300.1,
  },
  41: {
    40: 1300.1,
    42: 1432.1,
    173: 1543.21,
    174: 1354.32,
  },
  42: {
    41: 1432.1,
    43: 1243.21,
  },
  43: {
    42: 1243.21,
    44: 1176.54,
  },
  44: {
    43: 1176.54,
    45: 986.54,
  },
  45: {
    44: 986.54,
    46: 1243.21,
  },
  46: {
    8: 1687.54,
    45: 1243.21,
  },
  47: {
    8: 1456.78,
    48: 1023.45,
  },
  48: {
    47: 1023.45,
    49: 1198.76,
  },
  49: {
    48: 1198.76,
    50: 876.54,
    157: 2134.67,
  },
  50: {
    49: 876.54,
    51: 1321.43,
    93: 945.78,
    94: 1400.2,
  },
  51: {
    50: 1321.43,
    52: 864.32,
  },
  52: {
    51: 864.32,
    53: 765.43,
    123: 1132.87,
    124: 1654.32,
  },
  53: {
    52: 765.43,
    54: 1543.21,
  },
  54: {
    53: 1543.21,
    55: 1234.56,
  },
  55: {
    54: 1234.56,
    56: 1432.1,
  },
  56: {
    55: 1432.1,
    57: 987.65,
    205: 1243.76,
    206: 1176.43,
  },
  57: {
    56: 987.65,
    58: 1165.43,
  },
  58: {
    57: 1165.43,
    59: 1387.65,
  },
  59: {
    58: 1387.65,
    60: 1243.21,
    186: 1765.43,
    187: 1532.76,
  },
  60: {
    59: 1243.21,
    61: 1387.65,
  },
  61: {
    60: 1387.65,
    62: 1498.76,
  },
  62: {
    61: 1498.76,
    63: 1765.43,
  },
  63: {
    62: 1765.43,
    64: 1354.32,
  },
  64: {
    63: 1354.32,
    65: 1876.54,
  },
  65: {
    64: 1876.54,
    66: 1432.1,
  },
  66: {
    65: 1432.1,
    67: 1565.43,
  },
  67: {
    66: 1565.43,
    148: 1287.65,
  },
  69: {
    70: 1765.43,
    148: 1354.32,
  },
  70: {
    69: 1765.43,
    71: 2165.43,
  },
  71: {
    70: 2165.43,
  },
  72: {
    73: 1543.21,
  },
  73: {
    72: 1543.21,
    74: 1354.32,
  },
  74: {
    73: 1354.32,
    75: 1765.43,
    210: 1360.6,
  },
  75: {
    74: 1765.43,
    76: 1354.32,
    211: 1243.21,
  },
  76: {
    75: 1354.32,
    77: 1132.1,
  },
  77: {
    76: 1132.1,
    78: 1243.21,
  },
  78: {
    77: 1243.21,
    89: 1354.32,
  },
  79: {
    80: 1632.1,
    233: 1432.1,
  },
  80: {
    79: 1632.1,
    81: 1354.32,
  },
  81: {
    80: 1354.32,
    82: 1543.21,
    161: 1550.6,
    162: 2176.54,
  },
  82: {
    81: 1543.21,
    83: 1432.1,
  },
  83: {
    82: 1432.1,
    84: 1243.21,
  },
  84: {
    83: 1243.21,
    85: 1765.43,
  },
  85: {
    84: 1765.43,
    86: 1354.32,
  },
  86: {
    85: 1354.32,
    87: 1187.65,
  },
  87: {
    86: 1187.65,
    88: 2098.76,
    223: 2187.65,
    224: 1310.1,
  },
  88: {
    87: 2098.76,
    89: 1765.43,
  },
  89: {
    78: 1354.32,
    88: 1765.43,
    90: 2176.54,
  },
  90: {
    89: 2176.54,
    91: 1400.5,
  },
  91: {
    90: 1400.5,
    92: 1243.21,
  },
  92: {
    91: 1243.21,
    93: 1132.1,
    122: 1132.1,
    123: 1087.65,
  },
  93: {
    50: 945.78,
    92: 1132.1,
  },
  94: {
    50: 1400.2,
    95: 1354.32,
  },
  95: {
    94: 1354.32,
    96: 1132.1,
  },
  96: {
    95: 1132.1,
    97: 1100.4,
  },
  97: {
    96: 1100.4,
    98: 1200.3,
  },
  98: {
    97: 1200.3,
    99: 1243.21,
  },
  99: {
    98: 1243.21,
    100: 1354.32,
  },
  100: {
    35: 1243.21,
    99: 1354.32,
    101: 1132.1,
  },
  101: {
    100: 1132.1,
    102: 1087.65,
  },
  102: {
    101: 1087.65,
    103: 1354.32,
  },
  103: {
    102: 1354.32,
    104: 1243.21,
    177: 1432.1,
    178: 1432.1,
  },
  104: {
    103: 1243.21,
    105: 1132.1,
  },
  105: {
    104: 1132.1,
    106: 1087.65,
  },
  106: {
    105: 1087.65,
    107: 1354.32,
  },
  107: {
    106: 1354.32,
    108: 1243.21,
  },
  108: {
    107: 1243.21,
    109: 1432.1,
    195: 1876.54,
  },
  109: {
    108: 1432.1,
    110: 1087.65,
  },
  110: {
    109: 1087.65,
    111: 1354.32,
  },
  111: {
    110: 1354.32,
    112: 1543.21,
  },
  112: {
    111: 1543.21,
    113: 1765.43,
  },
  113: {
    112: 1765.43,
    114: 1243.21,
    239: 1610.7,
  },
  114: {
    113: 1243.21,
    115: 1132.1,
  },
  115: {
    114: 1132.1,
    116: 1087.65,
  },
  116: {
    115: 1087.65,
    117: 1354.32,
  },
  117: {
    116: 1354.32,
    118: 1243.21,
  },
  118: {
    117: 1243.21,
    119: 1132.1,
  },
  119: {
    118: 1132.1,
    120: 1087.65,
  },
  120: {
    119: 1087.65,
    121: 1543.21,
  },
  121: {
    49: 3432.1,
    120: 1543.21,
  },
  122: {
    92: 1132.1,
    158: 1243.21,
  },
  123: {
    52: 1132.87,
    92: 1087.65,
  },
  124: {
    52: 1654.32,
    125: 1765.43,
  },
  125: {
    124: 1765.43,
    126: 1398.76,
  },
  126: {
    125: 1398.76,
    127: 1554.32,
  },
  127: {
    126: 1554.32,
    128: 1243.21,
    206: 1321.54,
    221: 1432.1,
  },
  128: {
    127: 1243.21,
    129: 1354.32,
  },
  129: {
    128: 1354.32,
    130: 1176.54,
  },
  130: {
    129: 1176.54,
    131: 1432.1,
  },
  131: {
    130: 1432.1,
    132: 1265.43,
    167: 1654.32,
    182: 1432.1,
  },
  132: {
    131: 1265.43,
    134: 1487.65,
  },
  134: {
    132: 1487.65,
    135: 1798.76,
  },
  135: {
    134: 1798.76,
    136: 1543.21,
  },
  136: {
    135: 1543.21,
    137: 1687.65,
  },
  137: {
    136: 1687.65,
    138: 1765.43,
  },
  138: {
    137: 1765.43,
    139: 1432.1,
  },
  139: {
    138: 1432.1,
    140: 1654.32,
  },
  140: {
    139: 1654.32,
    141: 1487.65,
  },
  141: {
    140: 1487.65,
    142: 1354.32,
  },
  142: {
    141: 1354.32,
    220: 1876.54,
  },
  148: {
    67: 1287.65,
    69: 1354.32,
    168: 987.65,
  },
  150: {
    151: 987.65,
    168: 876.54,
  },
  151: {
    150: 987.65,
    152: 1132.1,
  },
  152: {
    151: 1132.1,
    153: 1243.21,
  },
  153: {
    152: 1243.21,
    169: 1710.8,
  },
  154: {
    121: 3432.1,
    155: 2876.54,
  },
  155: {
    154: 2876.54,
    156: 3187.65,
  },
  156: {
    155: 3187.65,
    157: 2765.43,
    181: 1643.21,
  },
  157: {
    49: 2134.67,
    156: 2765.43,
  },
  158: {
    122: 1243.21,
    159: 1354.32,
  },
  159: {
    158: 1354.32,
    160: 1087.65,
  },
  160: {
    8: 1243.56,
    159: 1087.65,
  },
  161: {
    81: 1550.6,
    162: 1354.32,
  },
  162: {
    81: 2176.54,
    161: 1354.32,
    163: 1530.4,
  },
  163: {
    162: 1530.4,
    164: 1520.3,
  },
  164: {
    163: 1520.3,
    165: 1510.2,
  },
  165: {
    164: 1510.2,
    166: 1243.21,
  },
  166: {
    165: 1243.21,
    167: 1354.32,
  },
  167: {
    131: 1654.32,
    166: 1354.32,
  },
  168: {
    148: 987.65,
    150: 876.54,
  },
  169: {
    153: 1710.8,
    170: 1720.9,
  },
  170: {
    169: 1720.9,
    171: 1132.1,
  },
  171: {
    170: 1132.1,
    172: 987.65,
  },
  172: {
    171: 987.65,
  },
  173: {
    41: 1543.21,
  },
  174: {
    16: 1543.21,
    41: 1354.32,
  },
  175: {
    16: 1432.1,
    176: 1543.21,
  },
  176: {
    175: 1543.21,
    177: 1243.21,
  },
  177: {
    103: 1432.1,
    176: 1243.21,
  },
  178: {
    103: 1432.1,
    179: 1354.32,
  },
  179: {
    178: 1354.32,
    180: 1765.43,
  },
  180: {
    179: 1765.43,
    181: 1543.21,
  },
  181: {
    156: 1643.21,
    180: 1543.21,
    203: 1354.32,
  },
  182: {
    131: 1432.1,
    183: 1243.21,
  },
  183: {
    182: 1243.21,
    184: 1354.32,
  },
  184: {
    183: 1354.32,
    185: 1243.21,
  },
  185: {
    184: 1243.21,
    186: 1354.32,
  },
  186: {
    59: 1765.43,
    185: 1354.32,
  },
  187: {
    59: 1532.76,
    69: 1354.32,
  },
  188: {
    69: 1354.32,
    189: 1243.21,
  },
  189: {
    188: 1243.21,
    190: 1654.32,
  },
  190: {
    189: 1654.32,
    191: 2143.21,
  },
  191: {
    190: 1876.54,
    192: 2143.21,
  },
  192: {
    191: 1543.21,
    193: 1765.43,
  },
  193: {
    192: 1543.21,
    194: 1432.1,
  },
  194: {
    193: 1432.1,
    195: 1543.21,
  },
  195: {
    108: 1876.54,
    194: 1543.21,
  },
  196: {
    22: 1243.21,
    197: 1432.1,
  },
  197: {
    196: 1432.1,
    198: 1654.32,
  },
  198: {
    197: 1654.32,
    199: 1243.21,
  },
  199: {
    198: 1243.21,
    200: 1765.43,
    202: 1765.43,
  },
  200: {
    199: 1765.43,
    201: 1432.1,
  },
  201: {
    200: 1432.1,
    202: 1543.21,
  },
  202: {
    199: 1765.43,
    201: 1543.21,
  },
  203: {
    181: 1354.32,
    204: 1432.1,
  },
  204: {
    203: 1432.1,
    205: 1243.21,
  },
  205: {
    56: 1243.76,
    204: 1243.21,
  },
  206: {
    56: 1176.43,
    127: 1321.54,
  },
  207: {
    208: 1330.3,
    224: 1320.2,
  },
  208: {
    209: 1340.4,
    224: 1330.3,
  },
  209: {
    208: 1340.4,
    210: 1350.5,
  },
  210: {
    74: 1360.6,
    209: 1350.5,
  },
  211: {
    75: 1243.21,
    212: 1132.1,
  },
  212: {
    211: 1132.1,
    213: 1087.65,
  },
  213: {
    5: 1243.21,
    212: 1087.65,
  },
  214: {
    5: 1410.7,
    215: 1420.8,
  },
  215: {
    214: 1420.8,
    216: 1430.9,
  },
  216: {
    215: 1430.9,
    217: 1440,
  },
  217: {
    216: 1440,
    218: 1450.1,
  },
  218: {
    217: 1450.1,
  },
  220: {
    142: 1876.54,
    147: 1876.54,
  },
  221: {
    127: 1432.1,
    222: 1243.21,
  },
  222: {
    221: 1243.21,
    223: 1432.1,
  },
  223: {
    87: 2187.65,
    222: 1432.1,
  },
  224: {
    87: 1310.1,
    207: 1320.2,
  },
  233: {
    79: 1432.1,
    234: 1765.43,
  },
  234: {
    233: 1765.43,
    235: 1243.21,
    500: 1243.21,
  },
  235: {
    234: 1243.21,
    236: 1132.1,
  },
  236: {
    235: 1132.1,
    237: 1265.43,
  },
  237: {
    236: 1265.43,
    238: 1543.21,
  },
  238: {
    237: 1543.21,
  },
  239: {
    113: 1610.7,
    240: 1876.54,
  },
  240: {
    239: 1876.54,
    241: 1243.21,
  },
  241: {
    240: 1243.21,
  },
  500: {
    501: 1243.21,
    234: 1243.21,
  },
  501: {
    500: 1243.21,
    502: 1243.21,
  },
  502: {
    501: 1243.21,
    503: 1243.21,
  },
  503: {
    502: 1243.21,
    504: 1243.21,
  },
  504: {
    503: 1243.21,
    505: 1243.21,
  },
  505: {
    504: 1243.21,
    506: 1243.21,
  },
  506: {
    505: 1243.21,
    507: 1243.21,
  },
  507: {
    506: 1243.21,
    508: 1243.21,
  },
  508: {
    507: 1243.21,
    509: 1243.21,
  },
  509: {
    508: 1243.21,
    510: 1243.21,
  },
  510: {
    509: 1243.21,
    511: 1243.21,
  },
  511: {
    510: 1243.21,
    512: 1243.21,
  },
  512: {
    511: 1243.21,
    513: 1243.21,
  },
  513: {
    512: 1243.21,
    514: 1243.21,
  },
  514: {
    513: 1243.21,
    515: 1243.21,
  },
  515: {
    514: 1243.21,
    516: 1243.21,
  },
  516: {
    515: 1243.21,
    517: 1243.21,
  },
  517: {
    516: 1243.21,
    518: 1243.21,
  },
  518: {
    517: 1243.21,
    519: 1243.21,
  },
  519: {
    518: 1243.21,
    520: 1243.21,
  },
  520: {
    519: 1243.21,
  },
};

let colorLines = {
  //Red Line
  'Dilshad Garden': '#CC0000',
  Jhilmil: '#CC0000',
  'Mansrover Park': '#CC0000', //Added/Corrected Name
  Shahdara: '#CC0000',
  Seelampur: '#CC0000', //Added/Corrected Name
  'Shastri Park': '#CC0000',
  'Tis Hazari': '#CC0000',
  'Pul Bangash': '#CC0000', //Corrected Name
  'Pratap Nagar': '#CC0000',
  'Shastri Nagar': '#CC0000',
  'Kanhaiya Nagar': '#CC0000',
  'Keshav Puram': '#CC0000',
  'Kohat Enclave': '#CC0000',
  Pitampura: '#CC0000',
  'Rohini East': '#CC0000',
  'Rohini West': '#CC0000',
  Rithala: '#CC0000',

  //Blue Line (Vaishali Branch)
  Vaishali: '#0000FF',
  Kaushambi: '#0000FF',
  'Preet Vihar': '#0000FF',
  'Nirman Vihar': '#0000FF',
  'Laxmi Nagar': '#0000FF',

  //Blue Line (Noida Branch)
  'Noida Electronic City': '#0000FF', //In graph, add if missing
  'Noida Sector 62': '#0000FF', //In graph, add if missing
  'Noida Sector 59': '#0000FF', //In graph, add if missing
  'Noida Sector 61': '#0000FF', //In graph, add if missing
  'Noida Sector 52': '#0000FF', //In graph, add if missing
  'Noida Sector 34': '#0000FF', //In graph, add if missing
  'Wave City Center Noida': '#0000FF', //Corrected Name (Wave City Center)
  'Golf Course': '#0000FF',
  'Noida Sector 18': '#0000FF', //Corrected Name
  'Noida Sector 16': '#0000FF', //Corrected Name
  'Noida Sector 15': '#0000FF', //Corrected Name
  'New Ashok Nagar': '#0000FF',
  'Mayur Vihar Extension': '#0000FF', //Corrected Name
  Akshardham: '#0000FF',

  //Blue Line (Main)
  Indraprastha: '#0000FF',
  'Supreme Court': '#0000FF', //Corrected Name
  Barakhamba: '#0000FF',
  'R K Ashram Marg': '#0000FF', //Corrected Name
  Jhandewalan: '#0000FF',
  'Karol Bagh': '#0000FF',
  'Rajendra Place': '#0000FF', //Added
  'Patel Nagar': '#0000FF',
  Shadipur: '#0000FF',
  'Moti Nagar': '#0000FF',
  'Ramesh Nagar': '#0000FF',
  'Tagore Garden': '#0000FF',
  'Subhash Nagar': '#0000FF', //Updated name
  'Tilak Nagar': '#0000FF',
  'Janakpuri East': '#0000FF', //Corrected Name
  'Uttam Nagar East': '#0000FF',
  'Uttam Nagar West': '#0000FF',
  Nawada: '#0000FF',
  'Dwarka Mor': '#0000FF',
  'Dwarka Sector - 14': '#0000FF', //Corrected Name
  'Dwarka Sector - 13': '#0000FF', //Corrected Name
  'Dwarka Sector - 12': '#0000FF', //Corrected Name
  'Dwarka Sector - 11': '#0000FF', //Corrected Name
  'Dwarka Sector - 10': '#0000FF', //Corrected Name
  'Dwarka Sector - 9': '#0000FF', //Corrected Name
  'Dwarka Sector - 8': '#0000FF', //Corrected Name

  //Green Line
  'Brigadier Hoshiyar Singh': '#008000', //Updated name
  'Bahadurgarh City': '#008000', //In graph, add if missing
  'Pandit Shree Ram Sharma': '#008000', //In graph, add if missing
  'Tikri Border': '#008000', //In graph, add if missing
  'Tikri Kalan': '#008000', //In graph, add if missing
  'Ghevra Metro Station': '#008000', //Updated name
  'Mundka Industrial Area': '#008000', //Added/Corrected Name
  Mundka: '#008000',
  'Rajdhani Park': '#008000',
  'Nangloi Railway Station': '#008000',
  Nangloi: '#008000',
  'Surajmal Stadium': '#008000', //Corrected Name
  'Udyog Nagar': '#008000',
  'Peera Garhi': '#008000',
  'Paschim Vihar (West)': '#008000', //Updated name format
  'Paschim Vihar (East)': '#008000', //Updated name format
  Madipur: '#008000',
  'Shivaji Park': '#008000',
  'Punjabi Bagh': '#008000',
  'Satguru Ram Singh Marg': '#008000',

  //Yellow Line
  'Samaypur Badli': '#F7D117',
  'Haiderpur Badli Mor': '#F7D117',
  Jahangirpuri: '#F7D117',
  'Adarsh Nagar': '#F7D117',
  'Model Town': '#F7D117',
  'GTB Nagar': '#F7D117', //Corrected Name
  Vishwavidyalaya: '#F7D117',
  'Vidhan Sabha': '#F7D117',
  'Civil Lines': '#F7D117',
  'Chandni Chowk': '#F7D117',
  'Chawri Bazar': '#F7D117',
  'Patel Chowk': '#F7D117',
  'Udyog Bhawan': '#F7D117',
  'Lok Kalyan Marg': '#F7D117',
  Jorbagh: '#F7D117',
  AIIMS: '#F7D117',
  'Green Park': '#F7D117',
  'Malviya Nagar': '#F7D117',
  Saket: '#F7D117',
  'Qutab Minar': '#F7D117',
  Chhattarpur: '#F7D117',
  Sultanpur: '#F7D117',
  Ghitorni: '#F7D117',
  'Arjan Garh': '#F7D117',
  Gurudronacharya: '#F7D117',
  'M G Road': '#F7D117',
  'IFFCO Chowk': '#F7D117',
  'Millennium City Centre Gurugram': '#F7D117', //Corrected Name

  //Violet Line
  'Lal Quila': '#8F00FF', //In graph, add if missing
  'Jama Masjid': '#8F00FF', //In graph, add if missing
  'Delhi Gate': '#8F00FF', //Added
  ITO: '#8F00FF',
  Janpath: '#8F00FF',
  'Khan Market': '#8F00FF',
  'JLN Stadium': '#8F00FF', //Corrected Name
  Jangpura: '#8F00FF',
  Moolchand: '#8F00FF',
  'Kailash Colony': '#8F00FF',
  'Nehru Place': '#8F00FF',
  'Govind Puri': '#8F00FF',
  'Jasola Apollo': '#8F00FF', //Corrected Name
  'Sarita Vihar': '#8F00FF',
  'Mohan Estate': '#8F00FF',
  Tughlakabad: '#8F00FF', //Corrected Name
  'Badarpur Border': '#8F00FF', //Added/Corrected Name
  Sarai: '#8F00FF',
  'NHPC Chowk': '#8F00FF',
  'Mewala Maharajpur': '#8F00FF',
  'Sector 28': '#8F00FF', //Updated name format
  'Raja Nahar Singh': '#8F00FF', //Updated name

  //Pink Line
  'Majlis Park': '#FF69B4',
  'Shalimar Bagh': '#FF69B4',
  Shakurpur: '#FF69B4',
  'ESI Hospital': '#FF69B4', //Corrected Name
  Mayapuri: '#FF69B4',
  'Naraina Vihar': '#FF69B4',
  'Delhi Cantt.': '#FF69B4', //Corrected Name
  'Sir Vishweshwaraiah Moti Bagh': '#FF69B4',
  'Bhikaji Cama Place': '#FF69B4',
  'Sarojini Nagar': '#FF69B4',
  'South Extension': '#FF69B4',
  Vinobapuri: '#FF69B4', //In graph, add if missing
  Ashram: '#FF69B4', //In graph, add if missing
  'Sarai Kale Khan': '#FF69B4', //In graph, add if missing
  'Hazrat Nizamuddin': '#FF69B4', //In graph, add if missing
  'Mayur Vihar Pocket 1': '#FF69B4', //Added
  'Trilokpuri Sanjay Lake': '#FF69B4',
  'East Vinod Nagar - Mayur Vihar Phase 2': '#FF69B4', //Updated name
  'Mandawali - West Vinod Nagar': '#FF69B4', //Corrected Name
  'IP Extension': '#FF69B4',
  'Karkarduma Court': '#FF69B4',
  'Krishna Nagar': '#FF69B4',
  'East Azad Nagar': '#FF69B4',
  Jaffrabad: '#FF69B4', //Added/Corrected Name
  'Maujpur - Babarpur': '#FF69B4', //Added/Corrected Name
  Gokulpuri: '#FF69B4',
  'Johri Enclave': '#FF69B4',
  'Shiv Vihar': '#FF69B4',

  //Magenta Line
  'Okhla Bird Sanctuary': '#800080',
  'Kalindi Kunj': '#800080',
  'Jasola Vihar Shaheen Bagh': '#800080', //Added
  'Okhla Vihar': '#800080', //Added
  'Jamia Millia Islamia': '#800080',
  'Sukhdev Vihar': '#800080',
  'Okhla NSIC': '#800080',
  'Nehru Enclave': '#800080', //Found in graph, added
  'Greater Kailash': '#800080', //Found in graph, added
  'Chirag Delhi': '#800080', //Found in graph, added
  'Panchsheel Park': '#800080', //Found in graph, added
  IIT: '#800080', //Added/Corrected Name
  'M G Road': '#800080', //Added/Corrected Name
  Munirka: '#800080', //Found in graph, added
  'Vasant Vihar': '#800080', //Found in graph, added
  'Shankar Vihar': '#800080', //Found in graph, added
  'Terminal 1 - IGI Airport': '#800080', //Added/Corrected Name
  'Sadar Bazar Cantonment': '#800080', //Updated name
  Palam: '#800080', //Found in graph, added
  'Dashrath Puri': '#800080', //Found in graph, added
  'Dabri Mor - Janakpuri South': '#800080', //Added/Corrected Name

  //Grey Line
  Nangli: '#808080',
  Najafgarh: '#808080',
  'Dhansa Bus Stand': '#808080',

  //Airport Express Line (Orange)
  'New Delhi Station': '#FFA500', //Use New Delhi only? Let's stick to graph name: New Delhi
  'Delhi Aerocity': '#FFA500',
  'Shivaji Stadium': '#FFA500',

  //Rapid Metro (Assigned #00AEEF)
  'Phase 1 (Rapid Metro)': '#00AEEF', //Updated name format
  'Belvedere Towers (Rapid Metro)': '#00AEEF', //Added
  'Cyber City (Rapid Metro)': '#00AEEF', //Added
  'Moulsari Avenue (Rapid Metro)': '#00AEEF', //Added
  'Phase 3 (Rapid Metro)': '#00AEEF', //Added
  'Sector 42-43 (Rapid Metro)': '#00AEEF', //Added/Corrected Name
  'Sector 53-54 (Rapid Metro)': '#00AEEF', //Added/Corrected Name
  'Sector 54 Chowk (Rapid Metro)': '#00AEEF', //Added/Corrected Name
  'Sector 55-56 (Rapid Metro)': '#00AEEF', //Added/Corrected Name

  //Interchanges
  'Kashmere Gate': 'interchange',
  Welcome: 'interchange', //Updated
  Inderlok: 'interchange',
  'Anand Vihar ISBT': 'interchange', //Corrected Name
  Karkarduma: 'interchange',
  'Yamuna Bank': 'interchange',
  'Mandi House': 'interchange',
  'Rajiv Chowk': 'interchange',
  'Kirti Nagar': 'interchange',
  'Rajouri Garden': 'interchange',
  'Janakpuri West': 'interchange', //Corrected Name
  Dwarka: 'interchange', //Updated
  'Dwarka Sector - 21': 'interchange',
  'Ashok Park Main': 'interchange',
  Azadpur: 'interchange',
  'New Delhi': 'interchange', //Updated Name Consistency
  'Central Secretariat': 'interchange',
  'Dilli Haat - INA': 'interchange',
  'Hauz Khas': 'interchange',
  'Sikanderpur (Rapid Metro)': 'interchange',
  'Lajpat Nagar': 'interchange',
  'Kalkaji Mandir': 'interchange',
  'Netaji Subhash Place': 'interchange', //Updated
  'Botanical Garden': 'interchange',
  'Mayur Vihar Phase 1': 'interchange', //Updated/Corrected Name
  'Punjabi Bagh West': 'interchange', //Assuming interchange intent
  'Durgabai Deshmukh South Campus': 'interchange',
  'Dhaula Kuan': 'interchange',
  'IGI Airport': 'interchange', //Updated
};

let colorLinesWithIds = {
  //Red Line
  1: '#CC0000', // Dilshad Garden
  2: '#CC0000', // Jhilmil
  3: '#CC0000', // Mansrover park
  4: '#CC0000', // Shahdara
  6: '#CC0000', // Seelam Pur
  7: '#CC0000', // Shastri Park
  9: '#CC0000', // Tis Hazari
  10: '#CC0000', // Pul Bangash
  11: '#CC0000', // Pratap Nagar
  12: '#CC0000', // Shastri Nagar
  14: '#CC0000', // Kanhaiya Nagar
  15: '#CC0000', // Keshav Puram
  17: '#CC0000', // Kohat Enclave
  18: '#CC0000', // Pitampura
  19: '#CC0000', // Rohini East
  20: '#CC0000', // Rohini West
  21: '#CC0000', // Rithala

  //Blue Line (Vaishali Branch)
  72: '#0000FF', // Vaishali
  73: '#0000FF', // Kaushambi
  76: '#0000FF', // Preet Vihar
  77: '#0000FF', // Nirman Vihar
  78: '#0000FF', // Laxmi Nagar

  //Blue Line (Noida Branch)
  238: '#0000FF', // Noida Electronic City
  237: '#0000FF', // Noida Sector 62
  236: '#0000FF', // Noida Sector 59
  235: '#0000FF', // Noida Sector 61
  234: '#0000FF', // Noida Sector 52
  233: '#0000FF', // Noida Sector 34
  79: '#0000FF', // Noida City Centre (Wave City Center Noida)
  80: '#0000FF', // Golf Course
  82: '#0000FF', // Noida Sec -18
  83: '#0000FF', // Noida Sec -16
  84: '#0000FF', // Noida Sec -15
  85: '#0000FF', // New Ashok Nagar
  86: '#0000FF', // Mayur Vihar Ext
  88: '#0000FF', // Akshardham

  //Blue Line (Main)
  90: '#0000FF', // Indraprastha
  91: '#0000FF', // Supreme Court
  93: '#0000FF', // Barakhamba
  94: '#0000FF', // RK Ashram Marg
  95: '#0000FF', // Jhandewalan
  96: '#0000FF', // Karol Bagh
  97: '#0000FF', // Rajendra Place
  98: '#0000FF', // Patel Nagar
  99: '#0000FF', // Shadipur
  101: '#0000FF', // Moti Nagar
  102: '#0000FF', // Ramesh Nagar
  104: '#0000FF', // Tagore Garden
  105: '#0000FF', // Subash Nagar
  106: '#0000FF', // Tilak Nagar
  107: '#0000FF', // Janak Puri East
  109: '#0000FF', // Uttam Nagar East
  110: '#0000FF', // Uttam Nagar West
  111: '#0000FF', // Nawada
  112: '#0000FF', // Dwarka Mor
  114: '#0000FF', // Dwarka Sector - 14
  115: '#0000FF', // Dwarka Sector - 13
  116: '#0000FF', // Dwarka Sector - 12
  117: '#0000FF', // Dwarka Sector - 11
  118: '#0000FF', // Dwarka Sector - 10
  119: '#0000FF', // Dwarka Sector - 9
  120: '#0000FF', // Dwarka Sector - 8

  //Green Line
  202: '#008000', // Brigadier Hoshiyar Singh
  201: '#008000', // Bahadurgarh City
  200: '#008000', // Pandit Shree Ram Sharma
  199: '#008000', // Tikri Border
  198: '#008000', // Tikri Kalan
  197: '#008000', // Ghevra Metro station
  196: '#008000', // Mundka Industrial Area (M.I.A)
  22: '#008000', // Mundka
  23: '#008000', // Rajdhani Park
  24: '#008000', // Nangloi Railway Station
  25: '#008000', // Nangloi
  26: '#008000', // Maharaja Surajmal Stadium
  27: '#008000', // Udyog Nagar
  28: '#008000', // Peera Garhi
  29: '#008000', // Paschim Vihar (West)
  30: '#008000', // Paschim Vihar (East)
  31: '#008000', // Madipur
  32: '#008000', // Shivaji Park
  33: '#008000', // Punjabi Bagh
  35: '#008000', // Satguru Ram Singh Marg

  //Yellow Line
  36: '#F7D117', // Samaypur Badli
  38: '#F7D117', // Haiderpur Badli Mor
  39: '#F7D117', // Jahangirpuri
  40: '#F7D117', // Adarsh Nagar
  42: '#F7D117', // Model Town
  43: '#F7D117', // Guru Tegh Bahadur Nagar
  44: '#F7D117', // Vishwavidyalaya
  45: '#F7D117', // Vidhan Sabha
  46: '#F7D117', // Civil Lines
  47: '#F7D117', // Chandni Chowk
  48: '#F7D117', // Chawri Bazar
  51: '#F7D117', // Patel Chowk
  53: '#F7D117', // Udyog Bhawan
  54: '#F7D117', // Lok Kalyan Marg
  55: '#F7D117', // Jorbagh
  57: '#F7D117', // AIIMS
  58: '#F7D117', // Green Park
  60: '#F7D117', // Malviya Nagar
  61: '#F7D117', // Saket
  62: '#F7D117', // Qutab Minar
  63: '#F7D117', // Chhattarpur
  64: '#F7D117', // Sultanpur
  65: '#F7D117', // Ghitorni
  66: '#F7D117', // Arjan Garh
  67: '#F7D117', // Gurudronacharya
  69: '#F7D117', // MG Road
  70: '#F7D117', // IFFCO Chowk
  71: '#F7D117', // Huda City Centre

  //Violet Line
  160: '#8F00FF', // Lal Quila
  159: '#8F00FF', // Jama Masjid
  158: '#8F00FF', // Delhi Gate
  122: '#8F00FF', // ITO
  123: '#8F00FF', // Janpath
  124: '#8F00FF', // Khan Market
  125: '#8F00FF', // Jawahar Lal Nehru Stadium
  126: '#8F00FF', // Jangpura
  128: '#8F00FF', // Moolchand
  129: '#8F00FF', // Kailash Colony
  130: '#8F00FF', // Nehru Place
  132: '#8F00FF', // Govind Puri
  134: '#8F00FF', // Jasola-Apollo
  135: '#8F00FF', // Sarita Vihar
  136: '#8F00FF', // Mohan Estate
  137: '#8F00FF', // Tughlakabad Station
  138: '#8F00FF', // Badarpur Border
  139: '#8F00FF', // Sarai
  140: '#8F00FF', // NHPC Chowk
  141: '#8F00FF', // Mewala Maharajpur
  142: '#8F00FF', // Sector-28
  220: '#8F00FF', // Raja Nahar Singh

  //Pink Line
  173: '#FF69B4', // Majlis Park
  174: '#FF69B4', // Shalimar Bagh
  175: '#FF69B4', // Shakurpur
  177: '#FF69B4', // ESI Basai Darapur
  178: '#FF69B4', // Mayapuri
  179: '#FF69B4', // Naraina Vihar
  180: '#FF69B4', // Delhi Cantt.
  203: '#FF69B4', // Sir Vishweshwaraiah Moti Bagh
  204: '#FF69B4', // Bhikaji Cama Place
  205: '#FF69B4', // Sarojini Nagar
  206: '#FF69B4', // South Extension
  221: '#FF69B4', // Vinobapuri
  222: '#FF69B4', // Ashram
  223: '#FF69B4', // Sarai Kale Khan - Nizamuddin
  224: '#FF69B4', // Mayur Vihar Pocket 1
  207: '#FF69B4', // Trilokpuri Sanjay Lake
  208: '#FF69B4', // East Vinod Nagar - Mayur Vihar-II
  209: '#FF69B4', // Mandawali - West Vinod Nagar
  210: '#FF69B4', // IP Extension
  211: '#FF69B4', // Karkarduma Court
  212: '#FF69B4', // Krishna Nagar
  213: '#FF69B4', // East Azad Nagar
  214: '#FF69B4', // Jafrabad
  215: '#FF69B4', // Maujpur - Babarpur
  216: '#FF69B4', // Gokulpuri
  217: '#FF69B4', // Johri Enclave
  218: '#FF69B4', // Shiv Vihar

  //Magenta Line
  161: '#800080', // Okhla Bird Sanctuary
  162: '#800080', // Kalindi Kunj
  163: '#800080', // Jasola Vihar Shaheen Bagh
  164: '#800080', // Okhla Vihar
  165: '#800080', // Jamia Millia Islamia
  166: '#800080', // Sukhdev Vihar
  167: '#800080', // Okhla NSIC
  182: '#800080', // Nehru Enclave
  183: '#800080', // Greater Kailash
  184: '#800080', // Chirag Delhi
  185: '#800080', // Panchsheel Park
  186: '#800080', // IIT
  187: '#800080', // RK Puram
  188: '#800080', // Munirka
  189: '#800080', // Vasant Vihar
  190: '#800080', // Shankar Vihar
  191: '#800080', // Terminal 1- IGI Airport
  192: '#800080', // Sadar Bazar Contonment
  193: '#800080', // Palam
  194: '#800080', // Dashrath Puri
  195: '#800080', // Dabri Mor - Janakpuri South

  //Grey Line
  239: '#808080', // Nangli
  240: '#808080', // Najafgarh
  241: '#808080', // Dhansa Bus Stand

  //Airport Express Line (Orange)
  49: '#FFA500', // New Delhi
  155: '#FFA500', // Delhi Aerocity
  157: '#FFA500', // Shivaji Stadium

  //Rapid Metro (Assigned #00AEEF)
  168: '#00AEEF', // Phase-I (Rapid Metro)
  150: '#00AEEF', // Belvedere Towers (Rapid Metro)
  151: '#00AEEF', // Cyber City (Rapid Metro)
  152: '#00AEEF', // Moulsari Avenue (Rapid Metro)
  153: '#00AEEF', // Phase 3 (Rapid Metro)
  169: '#00AEEF', // Sector 42-43 (Rapid Metro)
  170: '#00AEEF', // Sector 53-54 (Rapid Metro)
  171: '#00AEEF', // Sector 54 Chowk (Rapid Metro)
  172: '#00AEEF', // Sector 55-56 (Rapid Metro)

  //Aqua Line
  500: '#00FFFF', // Sector 51
  501: '#00FFFF', // Sector 50
  502: '#00FFFF', // Sector 76
  503: '#00FFFF', // Sector 101
  504: '#00FFFF', // Sector 81
  505: '#00FFFF', // NSEZ
  506: '#00FFFF', // Sector 83
  507: '#00FFFF', // Sector 137
  508: '#00FFFF', // Sector 142
  509: '#00FFFF', // Sector 143
  510: '#00FFFF', // Sector 144
  511: '#00FFFF', // Sector 145
  512: '#00FFFF', // Sector 146
  513: '#00FFFF', // Sector 147
  514: '#00FFFF', // Sector 148
  515: '#00FFFF', // Knowledge Park II
  516: '#00FFFF', // Pari Chowk
  517: '#00FFFF', // Alpha 1
  518: '#00FFFF', // Delta 1
  519: '#00FFFF', // GNIDA Office
  520: '#00FFFF', // Depot Station

  //Interchanges
  8: 'interchange', // Kashmere Gate
  5: 'interchange', // Welcome
  13: 'interchange', // Inderlok
  74: 'interchange', // Anand Vihar
  75: 'interchange', // Karkarduma
  89: 'interchange', // Yamuna Bank
  92: 'interchange', // Mandi House
  50: 'interchange', // Rajiv Chowk
  100: 'interchange', // Kirti Nagar
  103: 'interchange', // Rajouri Garden
  108: 'interchange', // Janak Puri West
  113: 'interchange', // Dwarka
  121: 'interchange', // Dwarka Sector - 21
  34: 'interchange', // Ashok Park Main
  41: 'interchange', // Azadpur
  49: 'interchange', // New Delhi
  52: 'interchange', // Central Secretariat
  56: 'interchange', // Dilli Haat - INA
  59: 'interchange', // Hauz Khas
  148: 'interchange', // Sikanderpur (Rapid Metro)
  127: 'interchange', // Lajpat Nagar
  131: 'interchange', // Kalkaji Mandir
  16: 'interchange', // Netaji Subash Place
  81: 'interchange', // Botanical Garden
  87: 'interchange', // Mayur Vihar-I
  176: 'interchange', // Punjabi Bagh West
  181: 'interchange', // Durgabai Deshmukh South Campus
  156: 'interchange', // Dhaula Kuan
  154: 'interchange', // IGI Airport
  234: 'interchange', 
};

export {graph, colorLines, graphWithIds, colorLinesWithIds};
