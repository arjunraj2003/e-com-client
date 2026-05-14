// India States → Districts → Pincode prefix ranges
// pincodePrefix: valid first-3-digit prefixes for the state

export interface DistrictInfo {
  name: string;
}

export interface StateInfo {
  name: string;
  pincodeRanges: [number, number][]; // [min, max] ranges (first 3 digits)
  districts: string[];
}

export const INDIA_STATES: StateInfo[] = [
  {
    name: 'Andhra Pradesh',
    pincodeRanges: [[500, 535]],
    districts: ['Anantapur','Chittoor','East Godavari','Guntur','Krishna','Kurnool','Nellore','Prakasam','Srikakulam','Visakhapatnam','Vizianagaram','West Godavari','YSR Kadapa'],
  },
  {
    name: 'Arunachal Pradesh',
    pincodeRanges: [[790, 792]],
    districts: ['Anjaw','Changlang','Dibang Valley','East Kameng','East Siang','Itanagar Capital Complex','Kamle','Kra Daadi','Kurung Kumey','Lepa Rada','Lohit','Longding','Lower Dibang Valley','Lower Siang','Lower Subansiri','Namsai','Pakke-Kessang','Papum Pare','Shi Yomi','Siang','Tawang','Tirap','Upper Siang','Upper Subansiri','West Kameng','West Siang'],
  },
  {
    name: 'Assam',
    pincodeRanges: [[781, 788]],
    districts: ['Baksa','Barpeta','Biswanath','Bongaigaon','Cachar','Charaideo','Chirang','Darrang','Dhemaji','Dhubri','Dibrugarh','Dima Hasao','Goalpara','Golaghat','Hailakandi','Hojai','Jorhat','Kamrup','Kamrup Metropolitan','Karbi Anglong','Karimganj','Kokrajhar','Lakhimpur','Majuli','Morigaon','Nagaon','Nalbari','Sivasagar','Sonitpur','South Salmara-Mankachar','Tinsukia','Udalguri','West Karbi Anglong'],
  },
  {
    name: 'Bihar',
    pincodeRanges: [[800, 855]],
    districts: ['Araria','Arwal','Aurangabad','Banka','Begusarai','Bhagalpur','Bhojpur','Buxar','Darbhanga','East Champaran','Gaya','Gopalganj','Jamui','Jehanabad','Kaimur','Katihar','Khagaria','Kishanganj','Lakhisarai','Madhepura','Madhubani','Munger','Muzaffarpur','Nalanda','Nawada','Patna','Purnia','Rohtas','Saharsa','Samastipur','Saran','Sheikhpura','Sheohar','Sitamarhi','Siwan','Supaul','Vaishali','West Champaran'],
  },
  {
    name: 'Chhattisgarh',
    pincodeRanges: [[490, 497]],
    districts: ['Balod','Baloda Bazar','Balrampur','Bastar','Bemetara','Bijapur','Bilaspur','Dantewada','Dhamtari','Durg','Gariaband','Gaurela-Pendra-Marwahi','Janjgir-Champa','Jashpur','Kabirdham','Kanker','Kondagaon','Korba','Koriya','Mahasamund','Mungeli','Narayanpur','Raigarh','Raipur','Rajnandgaon','Sukma','Surajpur','Surguja'],
  },
  {
    name: 'Goa',
    pincodeRanges: [[403, 403]],
    districts: ['North Goa','South Goa'],
  },
  {
    name: 'Gujarat',
    pincodeRanges: [[360, 396]],
    districts: ['Ahmedabad','Amreli','Anand','Aravalli','Banaskantha','Bharuch','Bhavnagar','Botad','Chhota Udaipur','Dahod','Dang','Devbhoomi Dwarka','Gandhinagar','Gir Somnath','Jamnagar','Junagadh','Kheda','Kutch','Mahisagar','Mehsana','Morbi','Narmada','Navsari','Panchmahal','Patan','Porbandar','Rajkot','Sabarkantha','Surat','Surendranagar','Tapi','Vadodara','Valsad'],
  },
  {
    name: 'Haryana',
    pincodeRanges: [[121, 136]],
    districts: ['Ambala','Bhiwani','Charkhi Dadri','Faridabad','Fatehabad','Gurugram','Hisar','Jhajjar','Jind','Kaithal','Karnal','Kurukshetra','Mahendragarh','Nuh','Palwal','Panchkula','Panipat','Rewari','Rohtak','Sirsa','Sonipat','Yamunanagar'],
  },
  {
    name: 'Himachal Pradesh',
    pincodeRanges: [[171, 177]],
    districts: ['Bilaspur','Chamba','Hamirpur','Kangra','Kinnaur','Kullu','Lahaul and Spiti','Mandi','Shimla','Sirmaur','Solan','Una'],
  },
  {
    name: 'Jharkhand',
    pincodeRanges: [[814, 835]],
    districts: ['Bokaro','Chatra','Deoghar','Dhanbad','Dumka','East Singhbhum','Garhwa','Giridih','Godda','Gumla','Hazaribagh','Jamtara','Khunti','Koderma','Latehar','Lohardaga','Pakur','Palamu','Ramgarh','Ranchi','Sahibganj','Seraikela Kharsawan','Simdega','West Singhbhum'],
  },
  {
    name: 'Karnataka',
    pincodeRanges: [[560, 591]],
    districts: ['Bagalkot','Ballari','Belagavi','Bengaluru Rural','Bengaluru Urban','Bidar','Chamarajanagar','Chikkaballapur','Chikkamagaluru','Chitradurga','Dakshina Kannada','Davanagere','Dharwad','Gadag','Hassan','Haveri','Kalaburagi','Kodagu','Kolar','Koppal','Mandya','Mysuru','Raichur','Ramanagara','Shivamogga','Tumakuru','Udupi','Uttara Kannada','Vijayapura','Yadgir'],
  },
  {
    name: 'Kerala',
    pincodeRanges: [[670, 695]],
    districts: ['Alappuzha','Ernakulam','Idukki','Kannur','Kasaragod','Kollam','Kottayam','Kozhikode','Malappuram','Palakkad','Pathanamthitta','Thiruvananthapuram','Thrissur','Wayanad'],
  },
  {
    name: 'Madhya Pradesh',
    pincodeRanges: [[450, 488]],
    districts: ['Agar Malwa','Alirajpur','Anuppur','Ashoknagar','Balaghat','Barwani','Betul','Bhind','Bhopal','Burhanpur','Chhatarpur','Chhindwara','Damoh','Datia','Dewas','Dhar','Dindori','Guna','Gwalior','Harda','Hoshangabad','Indore','Jabalpur','Jhabua','Katni','Khandwa','Khargone','Mandla','Mandsaur','Morena','Narsinghpur','Neemuch','Niwari','Panna','Raisen','Rajgarh','Ratlam','Rewa','Sagar','Satna','Sehore','Seoni','Shahdol','Shajapur','Sheopur','Shivpuri','Sidhi','Singrauli','Tikamgarh','Ujjain','Umaria','Vidisha'],
  },
  {
    name: 'Maharashtra',
    pincodeRanges: [[400, 445]],
    districts: ['Ahmednagar','Akola','Amravati','Aurangabad','Beed','Bhandara','Buldhana','Chandrapur','Dhule','Gadchiroli','Gondia','Hingoli','Jalgaon','Jalna','Kolhapur','Latur','Mumbai City','Mumbai Suburban','Nagpur','Nanded','Nandurbar','Nashik','Osmanabad','Palghar','Parbhani','Pune','Raigad','Ratnagiri','Sangli','Satara','Sindhudurg','Solapur','Thane','Wardha','Washim','Yavatmal'],
  },
  {
    name: 'Manipur',
    pincodeRanges: [[795, 795]],
    districts: ['Bishnupur','Chandel','Churachandpur','Imphal East','Imphal West','Jiribam','Kakching','Kamjong','Kangpokpi','Noney','Pherzawl','Senapati','Tamenglong','Tengnoupal','Thoubal','Ukhrul'],
  },
  {
    name: 'Meghalaya',
    pincodeRanges: [[793, 794]],
    districts: ['East Garo Hills','East Jaintia Hills','East Khasi Hills','Eastern West Khasi Hills','North Garo Hills','Ri Bhoi','South Garo Hills','South West Garo Hills','South West Khasi Hills','West Garo Hills','West Jaintia Hills','West Khasi Hills'],
  },
  {
    name: 'Mizoram',
    pincodeRanges: [[796, 796]],
    districts: ['Aizawl','Champhai','Hnahthial','Khawzawl','Kolasib','Lawngtlai','Lunglei','Mamit','Saiha','Saitual','Serchhip'],
  },
  {
    name: 'Nagaland',
    pincodeRanges: [[797, 798]],
    districts: ['Chumoukedima','Dimapur','Kiphire','Kohima','Longleng','Mokokchung','Mon','Noklak','Peren','Phek','Shamator','Tseminyu','Tuensang','Wokha','Zunheboto'],
  },
  {
    name: 'Odisha',
    pincodeRanges: [[751, 770]],
    districts: ['Angul','Balangir','Balasore','Bargarh','Bhadrak','Boudh','Cuttack','Deogarh','Dhenkanal','Gajapati','Ganjam','Jagatsinghpur','Jajpur','Jharsuguda','Kalahandi','Kandhamal','Kendrapara','Kendujhar','Khordha','Koraput','Malkangiri','Mayurbhanj','Nabarangpur','Nayagarh','Nuapada','Puri','Rayagada','Sambalpur','Sonepur','Sundargarh'],
  },
  {
    name: 'Punjab',
    pincodeRanges: [[140, 160]],
    districts: ['Amritsar','Barnala','Bathinda','Faridkot','Fatehgarh Sahib','Fazilka','Ferozepur','Gurdaspur','Hoshiarpur','Jalandhar','Kapurthala','Ludhiana','Mansa','Moga','Mohali','Muktsar','Pathankot','Patiala','Rupnagar','Sangrur','Shaheed Bhagat Singh Nagar','Tarn Taran'],
  },
  {
    name: 'Rajasthan',
    pincodeRanges: [[301, 345]],
    districts: ['Ajmer','Alwar','Banswara','Baran','Barmer','Bharatpur','Bhilwara','Bikaner','Bundi','Chittorgarh','Churu','Dausa','Dholpur','Dungarpur','Ganganagar','Hanumangarh','Jaipur','Jaisalmer','Jalore','Jhalawar','Jhunjhunu','Jodhpur','Karauli','Kota','Nagaur','Pali','Pratapgarh','Rajsamand','Sawai Madhopur','Sikar','Sirohi','Tonk','Udaipur'],
  },
  {
    name: 'Sikkim',
    pincodeRanges: [[737, 737]],
    districts: ['East Sikkim','North Sikkim','Pakyong','Soreng','South Sikkim','West Sikkim'],
  },
  {
    name: 'Tamil Nadu',
    pincodeRanges: [[600, 643]],
    districts: ['Ariyalur','Chengalpattu','Chennai','Coimbatore','Cuddalore','Dharmapuri','Dindigul','Erode','Kallakurichi','Kancheepuram','Kanyakumari','Karur','Krishnagiri','Madurai','Mayiladuthurai','Nagapattinam','Namakkal','Nilgiris','Perambalur','Pudukkottai','Ramanathapuram','Ranipet','Salem','Sivaganga','Tenkasi','Thanjavur','Theni','Thoothukudi','Tiruchirappalli','Tirunelveli','Tirupathur','Tiruppur','Tiruvallur','Tiruvannamalai','Tiruvarur','Vellore','Viluppuram','Virudhunagar'],
  },
  {
    name: 'Telangana',
    pincodeRanges: [[500, 509]],
    districts: ['Adilabad','Bhadradri Kothagudem','Hanumakonda','Hyderabad','Jagtial','Jangaon','Jayashankar Bhupalpally','Jogulamba Gadwal','Kamareddy','Karimnagar','Khammam','Komaram Bheem','Mahabubabad','Mahbubnagar','Mancherial','Medak','Medchal–Malkajgiri','Mulugu','Nagarkurnool','Nalgonda','Narayanpet','Nirmal','Nizamabad','Peddapalli','Rajanna Sircilla','Rangareddy','Sangareddy','Siddipet','Suryapet','Vikarabad','Wanaparthy','Warangal','Yadadri Bhuvanagiri'],
  },
  {
    name: 'Tripura',
    pincodeRanges: [[799, 799]],
    districts: ['Dhalai','Gomati','Khowai','North Tripura','Sepahijala','Sipahijala','South Tripura','Unakoti','West Tripura'],
  },
  {
    name: 'Uttar Pradesh',
    pincodeRanges: [[201, 285]],
    districts: ['Agra','Aligarh','Ambedkar Nagar','Amethi','Amroha','Auraiya','Ayodhya','Azamgarh','Baghpat','Bahraich','Ballia','Balrampur','Banda','Barabanki','Bareilly','Basti','Bhadohi','Bijnor','Budaun','Bulandshahr','Chandauli','Chitrakoot','Deoria','Etah','Etawah','Farrukhabad','Fatehpur','Firozabad','Gautam Buddha Nagar','Ghaziabad','Ghazipur','Gonda','Gorakhpur','Hamirpur','Hapur','Hardoi','Hathras','Jalaun','Jaunpur','Jhansi','Kannauj','Kanpur Dehat','Kanpur Nagar','Kasganj','Kaushambi','Kushinagar','Lakhimpur Kheri','Lalitpur','Lucknow','Maharajganj','Mahoba','Mainpuri','Mathura','Mau','Meerut','Mirzapur','Moradabad','Muzaffarnagar','Pilibhit','Pratapgarh','Prayagraj','Raebareli','Rampur','Saharanpur','Sambhal','Sant Kabir Nagar','Shahjahanpur','Shamli','Shravasti','Siddharthnagar','Sitapur','Sonbhadra','Sultanpur','Unnao','Varanasi'],
  },
  {
    name: 'Uttarakhand',
    pincodeRanges: [[244, 263]],
    districts: ['Almora','Bageshwar','Chamoli','Champawat','Dehradun','Haridwar','Nainital','Pauri Garhwal','Pithoragarh','Rudraprayag','Tehri Garhwal','Udham Singh Nagar','Uttarkashi'],
  },
  {
    name: 'West Bengal',
    pincodeRanges: [[700, 743]],
    districts: ['Alipurduar','Bankura','Birbhum','Cooch Behar','Dakshin Dinajpur','Darjeeling','Hooghly','Howrah','Jalpaiguri','Jhargram','Kalimpong','Kolkata','Malda','Murshidabad','Nadia','North 24 Parganas','Paschim Bardhaman','Paschim Medinipur','Purba Bardhaman','Purba Medinipur','Purulia','South 24 Parganas','Uttar Dinajpur'],
  },
  // Union Territories
  {
    name: 'Andaman and Nicobar Islands',
    pincodeRanges: [[744, 744]],
    districts: ['Nicobars','North and Middle Andaman','South Andaman'],
  },
  {
    name: 'Chandigarh',
    pincodeRanges: [[160, 160]],
    districts: ['Chandigarh'],
  },
  {
    name: 'Dadra and Nagar Haveli and Daman and Diu',
    pincodeRanges: [[362, 396]],
    districts: ['Dadra and Nagar Haveli','Daman','Diu'],
  },
  {
    name: 'Delhi',
    pincodeRanges: [[110, 110]],
    districts: ['Central Delhi','East Delhi','New Delhi','North Delhi','North East Delhi','North West Delhi','Shahdara','South Delhi','South East Delhi','South West Delhi','West Delhi'],
  },
  {
    name: 'Jammu and Kashmir',
    pincodeRanges: [[180, 194]],
    districts: ['Anantnag','Bandipora','Baramulla','Budgam','Doda','Ganderbal','Jammu','Kathua','Kishtwar','Kulgam','Kupwara','Poonch','Pulwama','Rajouri','Ramban','Reasi','Samba','Shopian','Srinagar','Udhampur'],
  },
  {
    name: 'Ladakh',
    pincodeRanges: [[194, 194]],
    districts: ['Kargil','Leh'],
  },
  {
    name: 'Lakshadweep',
    pincodeRanges: [[682, 682]],
    districts: ['Lakshadweep'],
  },
  {
    name: 'Puducherry',
    pincodeRanges: [[605, 607]],
    districts: ['Karaikal','Mahe','Puducherry','Yanam'],
  },
];

/** Returns true if a 6-digit pincode is valid for the given state */
export function isPincodeValidForState(pincode: string, stateName: string): boolean {
  if (!/^\d{6}$/.test(pincode)) return false;
  const state = INDIA_STATES.find(s => s.name === stateName);
  if (!state) return true; // unknown state, skip validation
  const prefix = parseInt(pincode.substring(0, 3), 10);
  return state.pincodeRanges.some(([min, max]) => prefix >= min && prefix <= max);
}

/** Returns districts for a given state name */
export function getDistricts(stateName: string): string[] {
  return INDIA_STATES.find(s => s.name === stateName)?.districts || [];
}
