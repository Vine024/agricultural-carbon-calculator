const carbonEmissionFactors = {
    crops: {
        rice: {
            name: '水稻',
            baseEmission: 225.8,
            n2oFactor: 3.2,
            ch4Factor: 165.5,
            fertilizerRate: 25.5,
            pesticideRate: 0.85,
            irrigationRate: 350.0,
            yieldPerMu: 500
        },
        wheat: {
            name: '小麦',
            baseEmission: 175.2,
            n2oFactor: 2.8,
            ch4Factor: 22.5,
            fertilizerRate: 22.8,
            pesticideRate: 0.65,
            irrigationRate: 280.0,
            yieldPerMu: 400
        },
        corn: {
            name: '玉米',
            baseEmission: 168.5,
            n2oFactor: 2.9,
            ch4Factor: 18.8,
            fertilizerRate: 24.2,
            pesticideRate: 0.72,
            irrigationRate: 320.0,
            yieldPerMu: 450
        },
        vegetables: {
            name: '蔬菜',
            baseEmission: 115.8,
            n2oFactor: 2.2,
            ch4Factor: 10.5,
            fertilizerRate: 35.5,
            pesticideRate: 1.25,
            irrigationRate: 420.0,
            yieldPerMu: 2000
        },
        fruits: {
            name: '水果',
            baseEmission: 155.4,
            n2oFactor: 2.5,
            ch4Factor: 15.8,
            fertilizerRate: 18.5,
            pesticideRate: 1.15,
            irrigationRate: 380.0,
            yieldPerMu: 1500
        },
        soybean: {
            name: '大豆',
            baseEmission: 105.8,
            n2oFactor: 2.1,
            ch4Factor: 20.5,
            fertilizerRate: 8.5,
            pesticideRate: 0.55,
            irrigationRate: 220.0,
            yieldPerMu: 180
        },
        cotton: {
            name: '棉花',
            baseEmission: 205.7,
            n2oFactor: 2.9,
            ch4Factor: 26.8,
            fertilizerRate: 28.5,
            pesticideRate: 1.35,
            irrigationRate: 450.0,
            yieldPerMu: 100
        },
        asparagus: {
            name: '芦笋',
            baseEmission: 138.5,
            n2oFactor: 2.4,
            ch4Factor: 13.8,
            fertilizerRate: 32.5,
            pesticideRate: 1.05,
            irrigationRate: 380.0,
            yieldPerMu: 1000
        }
    },
    inputs: {
        nitrogenFertilizer: 2.18,
        phosphateFertilizer: 1.45,
        potassiumFertilizer: 1.12,
        compoundFertilizer: 4.25,
        pesticide: 6.92,
        irrigation: 0.35,
        diesel: 3.36,
        electricity: 0.581,
        plasticFilm: 25.8,
        seed: 0.85,
        transport: 0.15
    },
    regions: {
        north: {
            name: '北方地区',
            factor: 1.0,
            irrigationFactor: 1.25,
            machineryFactor: 1.08,
            soilFactor: 1.12,
            climateFactor: 1.05
        },
        south: {
            name: '南方地区',
            factor: 1.15,
            irrigationFactor: 1.0,
            machineryFactor: 0.95,
            soilFactor: 1.25,
            climateFactor: 1.12
        },
        northwest: {
            name: '西北地区',
            factor: 1.35,
            irrigationFactor: 1.65,
            machineryFactor: 1.25,
            soilFactor: 0.95,
            climateFactor: 1.20
        },
        northeast: {
            name: '东北地区',
            factor: 0.88,
            irrigationFactor: 0.75,
            machineryFactor: 1.35,
            soilFactor: 1.05,
            climateFactor: 0.98
        }
    },
    soil: {
        n2oEmissionFactor: 0.0125,
        soilCarbonChange: 0.15,
        organicMatterDecomposition: 0.085,
        carbonSequestration: 0.12
    },
    standards: {
        gwp: {
            co2: 1,
            ch4: 25,
            n2o: 298
        },
        units: {
            area: 'mu',
            mass: 'kg',
            volume: 'm3',
            time: 'h'
        }
    },
    dataSources: {
        emissionFactors: '国家温室气体排放因子数据库（生态环境部，2026年第二版）',
        calculationMethod: '《农业食品行业的产品碳足迹核算通则》（T/CACE 079—2023）',
        activityData: '中国农业科学院农产品碳足迹因子基准数据库（2025）',
        officialDatabase: 'https://data.ncsc.org.cn/factories/index'
    }
};

function calculateCarbonEmission(formData) {
    const crop = carbonEmissionFactors.crops[formData.cropType];
    const region = carbonEmissionFactors.regions[formData.region];
    const gwp = carbonEmissionFactors.standards.gwp;
    
    let totalEmission = 0;
    let emissionBreakdown = {};
    
    const baseEmission = crop.baseEmission * formData.area * region.factor * region.climateFactor;
    emissionBreakdown.baseEmission = baseEmission;
    totalEmission += baseEmission;
    
    const soilN2OEmission = formData.area * crop.n2oFactor * gwp.n2o * region.soilFactor;
    emissionBreakdown.soilN2O = soilN2OEmission;
    totalEmission += soilN2OEmission;
    
    const ch4Emission = formData.area * crop.ch4Factor * gwp.ch4 * region.factor * region.climateFactor;
    emissionBreakdown.ch4 = ch4Emission;
    totalEmission += ch4Emission;
    
    const fertilizerEmission = (formData.fertilizer || crop.fertilizerRate * formData.area) * carbonEmissionFactors.inputs.nitrogenFertilizer * region.factor;
    emissionBreakdown.fertilizer = fertilizerEmission;
    totalEmission += fertilizerEmission;
    
    const pesticideEmission = (formData.pesticide || crop.pesticideRate * formData.area) * carbonEmissionFactors.inputs.pesticide * region.factor;
    emissionBreakdown.pesticide = pesticideEmission;
    totalEmission += pesticideEmission;
    
    const irrigationEmission = (formData.irrigation || crop.irrigationRate * formData.area) * carbonEmissionFactors.inputs.irrigation * region.irrigationFactor;
    emissionBreakdown.irrigation = irrigationEmission;
    totalEmission += irrigationEmission;
    
    const machineryEmission = formData.machinery * carbonEmissionFactors.inputs.diesel * region.machineryFactor;
    emissionBreakdown.machinery = machineryEmission;
    totalEmission += machineryEmission;
    
    const plasticFilmEmission = formData.area * 8.5 * carbonEmissionFactors.inputs.plasticFilm * region.factor;
    emissionBreakdown.plasticFilm = plasticFilmEmission;
    totalEmission += plasticFilmEmission;
    
    const seedEmission = formData.area * 2.5 * carbonEmissionFactors.inputs.seed * region.factor;
    emissionBreakdown.seed = seedEmission;
    totalEmission += seedEmission;
    
    const transportEmission = formData.yield * carbonEmissionFactors.inputs.transport * region.factor;
    emissionBreakdown.transport = transportEmission;
    totalEmission += transportEmission;
    
    const soilCarbonSequestration = formData.area * carbonEmissionFactors.soil.carbonSequestration * 44 / 12 * region.soilFactor;
    emissionBreakdown.soilCarbonSequestration = soilCarbonSequestration;
    totalEmission -= soilCarbonSequestration;
    
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
        dataSources: carbonEmissionFactors.dataSources
    };
}

function displayResults(results) {
    const resultsContainer = document.getElementById('results');
    
    const totalEmission = parseFloat(results.totalEmission);
    let emissionLevel = '';
    let emissionColor = '';
    
    if (totalEmission < 3000) {
        emissionLevel = '低碳排放';
        emissionColor = '#27ae60';
    } else if (totalEmission < 10000) {
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
                    <span class="detail-label">基础种植排放</span>
                    <span class="detail-value">${results.emissionBreakdown.baseEmission.toFixed(2)} kg CO₂</span>
                </div>
                <div class="detail-item">
                    <span class="detail-label">土壤N₂O排放</span>
                    <span class="detail-value">${results.emissionBreakdown.soilN2O.toFixed(2)} kg CO₂</span>
                </div>
                <div class="detail-item">
                    <span class="detail-label">CH₄排放</span>
                    <span class="detail-value">${results.emissionBreakdown.ch4.toFixed(2)} kg CO₂</span>
                </div>
                <div class="detail-item">
                    <span class="detail-label">化肥使用排放</span>
                    <span class="detail-value">${results.emissionBreakdown.fertilizer.toFixed(2)} kg CO₂</span>
                </div>
                <div class="detail-item">
                    <span class="detail-label">农药使用排放</span>
                    <span class="detail-value">${results.emissionBreakdown.pesticide.toFixed(2)} kg CO₂</span>
                </div>
                <div class="detail-item">
                    <span class="detail-label">灌溉排放</span>
                    <span class="detail-value">${results.emissionBreakdown.irrigation.toFixed(2)} kg CO₂</span>
                </div>
                <div class="detail-item">
                    <span class="detail-label">机械作业排放</span>
                    <span class="detail-value">${results.emissionBreakdown.machinery.toFixed(2)} kg CO₂</span>
                </div>
                <div class="detail-item">
                    <span class="detail-label">农膜使用排放</span>
                    <span class="detail-value">${results.emissionBreakdown.plasticFilm.toFixed(2)} kg CO₂</span>
                </div>
                <div class="detail-item">
                    <span class="detail-label">种子生产排放</span>
                    <span class="detail-value">${results.emissionBreakdown.seed.toFixed(2)} kg CO₂</span>
                </div>
                <div class="detail-item">
                    <span class="detail-label">运输排放</span>
                    <span class="detail-value">${results.emissionBreakdown.transport.toFixed(2)} kg CO₂</span>
                </div>
                <div class="detail-item" style="color: #27ae60;">
                    <span class="detail-label">土壤固碳</span>
                    <span class="detail-value">-${results.emissionBreakdown.soilCarbonSequestration.toFixed(2)} kg CO₂</span>
                </div>
            </div>
        </div>
        
        <div class="result-item">
            <h3>生产效率分析</h3>
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
            <h3>数据来源</h3>
            <div class="result-details">
                <div class="detail-item">
                    <span class="detail-label">排放因子</span>
                    <span class="detail-value">${results.dataSources.emissionFactors}</span>
                </div>
                <div class="detail-item">
                    <span class="detail-label">核算方法</span>
                    <span class="detail-value">${results.dataSources.calculationMethod}</span>
                </div>
                <div class="detail-item">
                    <span class="detail-label">活动水平数据</span>
                    <span class="detail-value">${results.dataSources.activityData}</span>
                </div>
                <div class="detail-item">
                    <span class="detail-label">官方数据库</span>
                    <a href="${results.dataSources.officialDatabase}" target="_blank" class="detail-value" style="color: #3498db; text-decoration: underline;">国家温室气体排放因子数据库</a>
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
        machinery: parseFloat(document.getElementById('machinery').value) || 0,
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
    }
});