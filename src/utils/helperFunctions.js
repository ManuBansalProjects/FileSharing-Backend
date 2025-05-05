const xlsx = require("xlsx");
const fs = require("fs/promises");
const path =  require('path');

const foodModel = require('../models/foods');
const actiivityModel = require('../models/activities');

async function readExcelToArray(filePath) {
    try {
      // Read the file buffer asynchronously
      const fileBuffer = await fs.readFile(filePath);
      // Parse it using xlsx
      const workbook = xlsx.read(fileBuffer, { type: "buffer" });
      const sheetName = workbook.SheetNames[0];
      const sheet = workbook.Sheets[sheetName];
      const jsonData = xlsx.utils.sheet_to_json(sheet);
      return jsonData;
    } catch (error) {
      console.error("Error reading Excel:", error);
      throw error;
    }
}
  
const convertFoodExcelDataToPlaneFields = async (excelList)=>{
    const foodList = excelList.map(food => ({
        name : food['name'],
        group : food['Food Group'],
        calories : food['Calories'],
        serving : food['Serving Description 1 (g)'] || '1 qty'
    }))
    return foodList;
}
const convertActivityExcelDataToPlaneFields = async (excelList)=>{
    const activityList = excelList.map(activity => ({
        name : activity['ACTIVITY'],
        category : activity['SPECIFIC MOTION'],
        met_value : activity['METs']
    }))
    return activityList;
}
  
const loadExcelFilesToDB = async()=>{
    try {
        const isfoodCollectionFilled = await foodModel.countDocuments();
        if(!isfoodCollectionFilled){    
            const foodFilePath = path.join(__dirname, '../assets', 'food-calories.xlsx');
            const foodExcelList = await readExcelToArray(foodFilePath);
            const foodList = await convertFoodExcelDataToPlaneFields(foodExcelList);
            await foodModel.insertMany(foodList);
        }

        const isactivityCollectionFilled = await actiivityModel.countDocuments();
        if(!isactivityCollectionFilled){    
            const activityFilePath = path.join(__dirname, '../assets', 'MET-values.xlsx');
            const activityExcelList = await readExcelToArray(activityFilePath);
            const activityList = await convertActivityExcelDataToPlaneFields(activityExcelList);
            await actiivityModel.insertMany(activityList);
        }

    } catch (error) {
        console.log(error);
    }
}

module.exports = {loadExcelFilesToDB}