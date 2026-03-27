const carbonEmissionFactors = {
    crops: {
        rice: {
            name: '水稻',
            fertilizerRate: 25.5,
            pesticideRate: 0.85,
            irrigationRate: 350.0,
            dieselRate: 15.0,
            plasticFilmRate: 8.0,
            yieldPerMu: 500
        },
        wheat: {
            name: '小麦',
            fertilizerRate: 22.8,
            pesticideRate: 0.65,
            irrigationRate: 280.0,
            dieselRate: 12.0,
            plasticFilmRate: 5.0,
            yieldPerMu: 400
        },
        corn: {
            name: '玉米',
            fertilizerRate: 24.2,
            pesticideRate: 0.72,
            irrigationRate: 320.0,
            dieselRate: 13.0,
            plasticFilmRate: 6.0,
            yieldPerMu: 450
        },
        vegetables: {
            name: '蔬菜',
            fertilizerRate: 35.5,
            pesticideRate: 1.25,
            irrigationRate: 420.0,
            dieselRate: 10.0,
            plasticFilmRate: 10.0,
            yieldPerMu: 2000
        },
        fruits: {
            name: '水果',
            fertilizerRate: 18.5,
            pesticideRate: 1.15,
            irrigationRate: 380.0,
            dieselRate: 8.0,
            plasticFilmRate: 3.0,
            yieldPerMu: 1500
        },
        soybean: {
            name: '大豆',
            fertilizerRate: 8.5,
            pesticideRate: 0.55,
            irrigationRate: 220.0,
            dieselRate: 10.0,
            plasticFilmRate: 4.0,
            yieldPerMu: 180
        },
        cotton: {
            name: '棉花',
            fertilizerRate: 28.5,
            pesticideRate: 1.35,
            irrigationRate: 450.0,
            dieselRate: 18.0,
            plasticFilmRate: 12.0,
            yieldPerMu: 100
        },
        asparagus: {
            name: '芦笋',
            fertilizerRate: 35.0,
            pesticideRate: 1.0,
            irrigationRate: 400.0,
            dieselRate: 15.0,
            plasticFilmRate: 8.0,
            yieldPerMu: 1000
        }
    },
    inputs: {
        nitrogenFertilizer: 7.62,
        phosphateFertilizer: 1.63,
        potassiumFertilizer: 0.66,
        pesticide: 18.5,
        diesel: 3.18,
        plasticFilm: 6.5,
        electricity: 0.5703
    },
    regions: {
        north: {
            name: '北方地区',
            electricityFactor: 0.581
        },
        south: {
            name: '南方地区',
            electricityFactor: 0.523
        },
        northwest: {
            name: '西北地区',
            electricityFactor: 0.625
        },
        northeast: {
            name: '东北地区',
            electricityFactor: 0.558
        }
    },
    standards: {
        gwp: {
            co2: 1,
            ch4: 25,
            n2o: 298
        },
        nationalStandard: 'GB/T 32151.23-2024',
        calculationMethod: '《温室气体排放核算与报告要求 第23部分：种植业机构》'
    },
    dataSources: {
        emissionFactors: '国家温室气体排放因子数据库（生态环境部，2026年第二版）',
        officialDatabase: 'https://data.ncsc.org.cn/factories/index',
        standardDatabase: 'https://std.samr.gov.cn'
    }
};

function calculateCarbonEmission(formData) {
    const crop = carbonEmissionFactors.crops[formData.cropType];
    const region = carbonEmissionFactors.regions[formData.region];
    
    let totalEmission = 0;
    let emissionBreakdown = {};
    
    const fertilizerAmount = formData.fertilizer || crop.fertilizerRate;
    const pesticideAmount = formData.pesticide || crop.pesticideRate;
    const irrigationAmount = formData.irrigation || crop.irrigationRate;
    const dieselAmount = formData.diesel || crop.dieselRate;
    const plasticFilmAmount = formData.plasticFilm || crop.plasticFilmRate;
    
    const fertilizerEmission = fertilizerAmount * carbonEmissionFactors.inputs.nitrogenFertilizer * formData.area;
    emissionBreakdown.fertilizer = fertilizerEmission;
    totalEmission += fertilizerEmission;
    
    const pesticideEmission = pesticideAmount * carbonEmissionFactors.inputs.pesticide * formData.area;
    emissionBreakdown.pesticide = pesticideEmission;
    totalEmission += pesticideEmission;
    
    const irrigationEmission = irrigationAmount * region.electricityFactor * formData.area;
    emissionBreakdown.irrigation = irrigationEmission;
    totalEmission += irrigationEmission;
    
    const dieselEmission = dieselAmount * carbonEmissionFactors.inputs.diesel * formData.area;
    emissionBreakdown.diesel = dieselEmission;
    totalEmission += dieselEmission;
    
    const plasticFilmEmission = plasticFilmAmount * carbonEmissionFactors.inputs.plasticFilm * formData.area;
    emissionBreakdown.plasticFilm = plasticFilmEmission;
    totalEmission += plasticFilmEmission;
    
    const n2oEmission = fertilizerAmount * 0.01 * 298 * formData.area;
    emissionBreakdown.n2o = n2oEmission;
    totalEmission += n2oEmission;
    
    if (totalEmission < 0) totalEmission = 0;
    
    const yieldPerMu = formData.yield / formData.area;
    const emissionPerYield = totalEmission / formData.yield;
    const emissionPerArea = totalEmission / formData.area;
    
    return {
        cropName: crop.name,
        totalEmission: totalEmission.toFixed(2),
        emissionPerYield: emissionPerYield.toFixed(4),
        emissionPerArea: emissionPerArea.toFixed(2),
        emissionBreakdown: emissionBreakdown,
        yieldPerMu: yieldPerMu.toFixed(2),
        formData: formData,
        regionName: region.name,
        dataSources: carbonEmissionFactors.dataSources,
        standards: carbonEmissionFactors.standards
    };
}

function displayResults(results) {
    const resultsContainer = document.getElementById('results');
    
    const totalEmission = parseFloat(results.totalEmission);
    let emissionLevel = '';
    let emissionColor = '';
    
    if (totalEmission < 1000) {
        emissionLevel = '低碳排放';
        emissionColor = '#27ae60';
    } else if (totalEmission < 3000) {
        emissionLevel = '中等排放';
        emissionColor = '#f39c12';
    } else {
        emissionLevel = '高碳排放';
        emissionColor = '#e74c3c';
    }
    
    const resultsHTML = `
        <div class="result-item" style="border-left: 5px solid ${emissionColor};">
            <h3>总碳排放量</h3>
            <div class="result-value" style="color: ${emissionColor};">${results.totalEmission}</div>
            <div class="result-unit">公斤CO₂当量</div>
            <div style="margin-top: 10px; padding: 8px; background: ${emissionColor}20; border-radius: 5px; color: ${emissionColor}; font-weight: 600;">
                ${emissionLevel}
            </div>
        </div>
        
        <div class="result-item">
            <h3>单位产量碳排放</h3>
            <div class="result-value">${results.emissionPerYield}</div>
            <div class="result-unit">公斤CO₂当量/公斤产量</div>
        </div>
        
        <div class="result-item">
            <h3>单位面积碳排放</h3>
            <div class="result-value">${results.emissionPerArea}</div>
            <div class="result-unit">公斤CO₂当量/亩</div>
        </div>
        
        <div class="result-item">
            <h3>碳排放构成</h3>
            <div class="result-details">
                <div class="detail-item">
                    <span class="detail-label">化肥排放</span>
                    <span class="detail-value">${results.emissionBreakdown.fertilizer.toFixed(2)} kg CO₂</span>
                </div>
                <div class="detail-item">
                    <span class="detail-label">农药排放</span>
                    <span class="detail-value">${results.emissionBreakdown.pesticide.toFixed(2)} kg CO₂</span>
                </div>
                <div class="detail-item">
                    <span class="detail-label">灌溉排放</span>
                    <span class="detail-value">${results.emissionBreakdown.irrigation.toFixed(2)} kg CO₂</span>
                </div>
                <div class="detail-item">
                    <span class="detail-label">柴油排放</span>
                    <span class="detail-value">${results.emissionBreakdown.diesel.toFixed(2)} kg CO₂</span>
                </div>
                <div class="detail-item">
                    <span class="detail-label">农膜排放</span>
                    <span class="detail-value">${results.emissionBreakdown.plasticFilm.toFixed(2)} kg CO₂</span>
                </div>
                <div class="detail-item">
                    <span class="detail-label">农田N₂O排放</span>
                    <span class="detail-value">${results.emissionBreakdown.n2o.toFixed(2)} kg CO₂</span>
                </div>
            </div>
        </div>
        
        <div class="result-item">
            <h3>生产情况</h3>
            <div class="result-details">
                <div class="detail-item">
                    <span class="detail-label">作物类型</span>
                    <span class="detail-value">${results.cropName}</span>
                </div>
                <div class="detail-item">
                    <span class="detail-label">种植区域</span>
                    <span class="detail-value">${results.regionName}</span>
                </div>
                <div class="detail-item">
                    <span class="detail-label">种植面积</span>
                    <span class="detail-value">${results.formData.area} 亩</span>
                </div>
                <div class="detail-item">
                    <span class="detail-label">总产量</span>
                    <span class="detail-value">${results.formData.yield} 公斤</span>
                </div>
                <div class="detail-item">
                    <span class="detail-label">亩产量</span>
                    <span class="detail-value">${results.yieldPerMu} 公斤/亩</span>
                </div>
            </div>
        </div>
        
        <div class="result-item">
            <h3>核算标准</h3>
            <div class="result-details">
                <div class="detail-item">
                    <span class="detail-label">国家标准</span>
                    <span class="detail-value">${results.standards.nationalStandard}</span>
                </div>
                <div class="detail-item">
                    <span class="detail-label">核算方法</span>
                    <span class="detail-value">${results.standards.calculationMethod}</span>
                </div>
            </div>
        </div>
        
        <div class="result-item">
            <h3>数据来源</h3>
            <div class="result-details">
                <div class="detail-item">
                    <span class="detail-label">排放因子</span>
                    <span class="detail-value">${results.dataSources.emissionFactors}</span>
                </div>
                <div class="detail-item">
                    <span class="detail-label">官方数据库</span>
                    <a href="${results.dataSources.officialDatabase}" target="_blank" class="detail-value" style="color: #3498db; text-decoration: underline;">国家温室气体排放因子数据库</a>
                </div>
                <div class="detail-item">
                    <span class="detail-label">标准数据库</span>
                    <a href="${results.dataSources.standardDatabase}" target="_blank" class="detail-value" style="color: #3498db; text-decoration: underline;">全国标准信息公共服务平台</a>
                </div>
            </div>
        </div>
    `;
    
    resultsContainer.innerHTML = resultsHTML;
}

document.getElementById('carbonForm').addEventListener('submit', function(e) {
    e.preventDefault();
    
    const formData = {
        cropType: document.getElementById('cropType').value,
        area: parseFloat(document.getElementById('area').value) || 0,
        yield: parseFloat(document.getElementById('yield').value) || 0,
        fertilizer: parseFloat(document.getElementById('fertilizer').value) || 0,
        pesticide: parseFloat(document.getElementById('pesticide').value) || 0,
        irrigation: parseFloat(document.getElementById('irrigation').value) || 0,
        diesel: parseFloat(document.getElementById('diesel').value) || 0,
        plasticFilm: parseFloat(document.getElementById('plasticFilm').value) || 0,
        region: document.getElementById('region').value
    };
    
    if (formData.area <= 0 || formData.yield <= 0) {
        alert('请输入有效的种植面积和产量！');
        return;
    }
    
    const results = calculateCarbonEmission(formData);
    displayResults(results);
});

document.getElementById('cropType').addEventListener('change', function() {
    const cropType = this.value;
    if (cropType) {
        const crop = carbonEmissionFactors.crops[cropType];
        document.getElementById('yield').placeholder = `建议产量：${crop.yieldPerMu}公斤/亩`;
        document.getElementById('fertilizer').placeholder = `建议化肥用量：${crop.fertilizerRate}公斤/亩`;
        document.getElementById('pesticide').placeholder = `建议农药用量：${crop.pesticideRate}公斤/亩`;
        document.getElementById('irrigation').placeholder = `建议灌溉用水：${crop.irrigationRate}立方米/亩`;
        document.getElementById('diesel').placeholder = `建议柴油用量：${crop.dieselRate}升/亩`;
        document.getElementById('plasticFilm').placeholder = `建议农膜用量：${crop.plasticFilmRate}公斤/亩`;
    }
});