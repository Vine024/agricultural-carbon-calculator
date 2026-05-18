const PROTECTION_PASSWORD = '0313';
let isAuthenticated = false;

function checkPassword() {
    const passwordInput = document.getElementById('accessPassword');
    const password = passwordInput.value;
    
    if (password === PROTECTION_PASSWORD) {
        isAuthenticated = true;
        document.getElementById('calculator-section').style.display = 'block';
        document.getElementById('password-section').style.display = 'none';
    } else {
        alert('密码错误，请重新输入！');
        passwordInput.value = '';
        passwordInput.focus();
    }
}

const carbonEmissionFactors = {
    crops: {
        tomato: {
            name: '番茄',
            fertilizerRate: 520,
            pesticideRate: 8.0,
            irrigationRate: 520,
            dieselRate: 15,
            plasticFilmRate: 90,
            yieldPerMu: 4500,
            isFacility: true
        },
        cucumber: {
            name: '黄瓜',
            fertilizerRate: 580,
            pesticideRate: 9.5,
            irrigationRate: 580,
            dieselRate: 15,
            plasticFilmRate: 90,
            yieldPerMu: 5200,
            isFacility: true
        },
        eggplant: {
            name: '茄子',
            fertilizerRate: 480,
            pesticideRate: 7.0,
            irrigationRate: 450,
            dieselRate: 12,
            plasticFilmRate: 85,
            yieldPerMu: 3800,
            isFacility: true
        },
        pepper: {
            name: '辣椒',
            fertilizerRate: 460,
            pesticideRate: 8.5,
            irrigationRate: 480,
            dieselRate: 12,
            plasticFilmRate: 85,
            yieldPerMu: 3200,
            isFacility: true
        },
        lettuce: {
            name: '生菜',
            fertilizerRate: 400,
            pesticideRate: 4.0,
            irrigationRate: 400,
            dieselRate: 10,
            plasticFilmRate: 70,
            yieldPerMu: 2800,
            isFacility: true
        },
        celery: {
            name: '芹菜',
            fertilizerRate: 460,
            pesticideRate: 4.5,
            irrigationRate: 450,
            dieselRate: 10,
            plasticFilmRate: 75,
            yieldPerMu: 4500,
            isFacility: true
        },
        strawberry: {
            name: '草莓',
            fertilizerRate: 440,
            pesticideRate: 5.5,
            irrigationRate: 420,
            dieselRate: 12,
            plasticFilmRate: 95,
            yieldPerMu: 1800,
            isFacility: true
        },
        melon: {
            name: '甜瓜',
            fertilizerRate: 350,
            pesticideRate: 6.0,
            irrigationRate: 500,
            dieselRate: 12,
            plasticFilmRate: 80,
            yieldPerMu: 2200,
            isFacility: true
        }
    },
    inputs: {
        compoundFertilizer: 5.20,
        urea: 2.16,
        ammoniumNitrate: 3.57,
        potassiumChloride: 0.64,
        phosphateFertilizer: 1.64,
        pesticide: 4.90,
        diesel: 2.63,
        plasticFilm: 3.80,
        electricity: 0.581
    },
    irrigation: {
        energyPerM3: 0.15,
        pumpEfficiency: 0.60
    },
    n2o: {
        directEmissionFactor: 0.012,
        indirectEmissionFactor: 0.008,
        n2oToN: 44 / 28,
        gwp: 265
    },
    regions: {
        north: {
            name: '北方地区',
            electricityFactor: 0.68,
            cfMultiplier: 1.0
        },
        south: {
            name: '南方地区',
            electricityFactor: 0.48,
            cfMultiplier: 0.92
        },
        northwest: {
            name: '西北地区',
            electricityFactor: 0.75,
            cfMultiplier: 1.05
        },
        northeast: {
            name: '东北地区',
            electricityFactor: 0.62,
            cfMultiplier: 0.95
        }
    },
    standards: {
        nationalStandard: 'GB/T 32151.23-2024',
        groupStandard: 'T/ZGCERIS 0003-2024',
        groupStandard2: 'T/LCAA 013-2024',
        groupStandard3: 'T/ZGCERIS 0001-2024',
        proposedStandard: 'GB/T XXXX-2027 (计划号: 20261459-T-467)',
        calculationMethod: '《设施土培茄果类碳足迹核算技术规范》'
    },
    dataSources: {
        emissionFactors: '国家温室气体排放因子数据库（第二版）',
        emissionFactorUrl: 'https://data.ncsc.org.cn/factories/index',
        researchData: '储霞玲等（2023）《农业环境科学学报》',
        researchData2: '华中农业大学李强团队（2025）Agriculture Communications',
        faostat: 'FAOSTAT 农业食品系统温室气体排放数据库',
        standardDatabase: 'https://std.samr.gov.cn'
    },
    benchmark: {
        tomatoNationalAverage: 8698,
        tomatoRangeMin: 5789,
        tomatoRangeMax: 13780,
        openFieldAverage: 4630,
        northTomatoCarbonIntensity: 354.4,
        unit: 'kg CO₂e/公顷',
        emissionSourceShare: {
            fertilizer: 73,
            plasticFilm: 12,
            energy: 8,
            pesticide: 4,
            n2o: 3
        }
    },
    dataPriority: [
        { priority: 1, source: '国家温室气体排放因子数据库（第二版）', usage: '所有因子的首选' },
        { priority: 2, source: '国家标准（20261459-T-467，2027后）', usage: '核算方法规范' },
        { priority: 3, source: 'T/ZGCERIS 0003-2024', usage: '设施茄果类核算' },
        { priority: 4, source: '学术文献中的本地化因子', usage: '因子缺失时的补充' }
    ]
};

function calculateCarbonEmission(formData) {
    const crop = carbonEmissionFactors.crops[formData.cropType];
    const region = carbonEmissionFactors.regions[formData.region];
    const inputs = carbonEmissionFactors.inputs;
    const n2o = carbonEmissionFactors.n2o;
    
    let totalEmission = 0;
    let emissionBreakdown = {};
    
    const fertilizerAmount = formData.fertilizer || crop.fertilizerRate;
    const pesticideAmount = formData.pesticide || crop.pesticideRate;
    const irrigationAmount = formData.irrigation || crop.irrigationRate;
    const dieselAmount = formData.diesel || crop.dieselRate;
    const plasticFilmAmount = formData.plasticFilm || crop.plasticFilmRate;
    const areaMu = formData.area;
    
    const fertilizerEmission = fertilizerAmount * inputs.compoundFertilizer * areaMu * region.cfMultiplier;
    emissionBreakdown.fertilizer = fertilizerEmission;
    totalEmission += fertilizerEmission;
    
    const pesticideEmission = pesticideAmount * inputs.pesticide * areaMu * region.cfMultiplier;
    emissionBreakdown.pesticide = pesticideEmission;
    totalEmission += pesticideEmission;
    
    const irrigationEnergy = irrigationAmount * carbonEmissionFactors.irrigation.energyPerM3 / carbonEmissionFactors.irrigation.pumpEfficiency;
    const irrigationEmission = irrigationEnergy * region.electricityFactor * areaMu;
    emissionBreakdown.irrigation = irrigationEmission;
    totalEmission += irrigationEmission;
    
    const dieselEmission = dieselAmount * inputs.diesel * areaMu;
    emissionBreakdown.diesel = dieselEmission;
    totalEmission += dieselEmission;
    
    const plasticFilmEmission = plasticFilmAmount * inputs.plasticFilm * areaMu * 1.2;
    emissionBreakdown.plasticFilm = plasticFilmEmission;
    totalEmission += plasticFilmEmission;
    
    const directN2O = fertilizerAmount * n2o.directEmissionFactor * n2o.n2oToN * n2o.gwp * areaMu;
    const indirectN2O = fertilizerAmount * n2o.indirectEmissionFactor * n2o.n2oToN * n2o.gwp * areaMu;
    const n2oEmission = (directN2O + indirectN2O) * region.cfMultiplier;
    emissionBreakdown.n2o = n2oEmission;
    totalEmission += n2oEmission;
    
    if (totalEmission < 0) totalEmission = 0;
    
    const yieldPerMu = formData.yield / areaMu;
    const totalYieldTons = formData.yield / 1000;
    const emissionPerYield = totalEmission / formData.yield;
    const emissionPerArea = totalEmission / areaMu;
    const emissionPerHa = totalEmission * 15;
    const carbonIntensity = totalEmission / totalYieldTons;
    
    return {
        cropName: crop.name,
        totalEmission: totalEmission.toFixed(2),
        emissionPerYield: emissionPerYield.toFixed(4),
        emissionPerArea: emissionPerArea.toFixed(2),
        emissionPerHa: emissionPerHa.toFixed(2),
        carbonIntensity: carbonIntensity.toFixed(2),
        emissionBreakdown: emissionBreakdown,
        yieldPerMu: yieldPerMu.toFixed(2),
        totalYieldTons: totalYieldTons.toFixed(2),
        formData: formData,
        regionName: region.name,
        dataSources: carbonEmissionFactors.dataSources,
        standards: carbonEmissionFactors.standards,
        benchmark: carbonEmissionFactors.benchmark,
        dataPriority: carbonEmissionFactors.dataPriority
    };
}

function generateImprovementSuggestions(results) {
    const suggestions = [];
    const totalEmission = parseFloat(results.totalEmission);
    const perHa = parseFloat(results.emissionPerHa);
    const carbonIntensity = parseFloat(results.carbonIntensity);
    const benchmark = carbonEmissionFactors.benchmark;
    
    const fertilizerPercent = results.emissionBreakdown.fertilizer / totalEmission * 100;
    const n2oPercent = results.emissionBreakdown.n2o / totalEmission * 100;
    const plasticPercent = results.emissionBreakdown.plasticFilm / totalEmission * 100;
    const dieselPercent = results.emissionBreakdown.diesel / totalEmission * 100;
    const irrigationPercent = results.emissionBreakdown.irrigation / totalEmission * 100;
    const pesticidePercent = results.emissionBreakdown.pesticide / totalEmission * 100;
    
    const formData = results.formData;
    const crop = carbonEmissionFactors.crops[formData.cropType];
    const currentFertilizer = formData.fertilizer || crop.fertilizerRate;
    const currentPlastic = formData.plasticFilm || crop.plasticFilmRate;
    const currentDiesel = formData.diesel || crop.dieselRate;
    const currentIrrigation = formData.irrigation || crop.irrigationRate;
    const currentPesticide = formData.pesticide || crop.pesticideRate;
    
    if (perHa > benchmark.tomatoNationalAverage) {
        suggestions.push({
            priority: 'high',
            category: '整体评估',
            title: '整体碳排放偏高',
            description: `当前碳排放(${perHa.toFixed(0)} kg CO₂e/公顷)高于全国平均水平(${benchmark.tomatoNationalAverage} kg CO₂e/公顷)，建议从以下方面进行优化。`,
            actions: [
                '优先控制化肥和农膜两大排放源',
                '采用测土配方施肥精准控制用量',
                '使用可降解农膜或减少农膜厚度',
                '优化灌溉方式减少能耗'
            ],
            expectedReduction: `预计可减排15-25%`,
            color: '#e74c3c'
        });
    }
    
    if (carbonIntensity > benchmark.northTomatoCarbonIntensity * 1.15) {
        suggestions.push({
            priority: 'high',
            category: '碳强度',
            title: '碳强度超标',
            description: `当前碳强度(${carbonIntensity.toFixed(1)} kg CO₂e/吨)高于北方日光温室番茄标准值(${benchmark.northTomatoCarbonIntensity} kg CO₂e/吨)。`,
            actions: [
                '提高产量与投入比，优化种植密度',
                '选用高产抗病品种，减少投入品使用',
                '增加有机肥替代比例，改善土壤固碳能力',
                '适当延长采收期，提高整体产量'
            ],
            expectedReduction: `目标降至${benchmark.northTomatoCarbonIntensity} kg CO₂e/吨以下`,
            color: '#e74c3c'
        });
    }
    
    if (fertilizerPercent > 70) {
        const suggestedReduction15 = Math.round(currentFertilizer * 0.15);
        const suggestedReduction20 = Math.round(currentFertilizer * 0.20);
        const emissionReduction15 = (suggestedReduction15 * carbonEmissionFactors.inputs.compoundFertilizer * formData.area).toFixed(0);
        const emissionReduction20 = (suggestedReduction20 * carbonEmissionFactors.inputs.compoundFertilizer * formData.area).toFixed(0);
        
        suggestions.push({
            priority: 'high',
            category: '化肥优化',
            title: '化肥排放占比过高',
            description: `化肥排放占比${fertilizerPercent.toFixed(1)}%，是最大的碳排放源（标准约73%）。`,
            actions: [
                `方案一：减少15%用量 → 从${currentFertilizer}降至${Math.round(currentFertilizer * 0.85)}公斤/亩，可减排${emissionReduction15} kg CO₂e`,
                `方案二：减少20%用量 → 从${currentFertilizer}降至${Math.round(currentFertilizer * 0.80)}公斤/亩，可减排${emissionReduction20} kg CO₂e`,
                '采用测土配方施肥技术，实现精准减量',
                '使用缓控释肥料，减少氮素流失',
                '增施有机肥/生物肥替代部分化肥（替代比例建议20-30%）',
                '应用硝化抑制剂，降低N₂O排放',
                '分次施肥，避免一次性大量施用'
            ],
            expectedReduction: `可减排${emissionReduction15}-${emissionReduction20} kg CO₂e`,
            color: '#e74c3c'
        });
    } else if (fertilizerPercent > 65) {
        suggestions.push({
            priority: 'medium',
            category: '化肥优化',
            title: '化肥用量可优化',
            description: `化肥排放占比${fertilizerPercent.toFixed(1)}%，接近理想范围。`,
            actions: [
                '可进一步优化施肥时间，采用水肥一体化',
                '适当增加有机肥比例，改善土壤质量',
                '定期进行土壤检测，实现精准施肥'
            ],
            expectedReduction: `可进一步降低5-10%排放`,
            color: '#f39c12'
        });
    }
    
    if (n2oPercent > 12) {
        suggestions.push({
            priority: 'high',
            category: '土壤排放',
            title: 'N₂O排放需控制',
            description: `土壤N₂O排放占比${n2oPercent.toFixed(1)}%（主要为化肥转化），N₂O增温潜势是CO₂的265倍。`,
            actions: [
                '使用控释氮肥，减少硝化过程中N₂O排放',
                '添加硝化抑制剂（如DMPP），降低N₂O排放30-50%',
                '采用滴灌施肥，减少表层氮素积累',
                '避免在高温季节大量施用氮肥',
                '配合灌溉进行分次施肥，减少氮素深层淋溶',
                '推广秸秆还田，增加土壤有机质含量'
            ],
            expectedReduction: `可减排30-50% N₂O排放`,
            color: '#e74c3c'
        });
    }
    
    if (plasticPercent > 10) {
        const suggestedReduction20 = Math.round(currentPlastic * 0.20);
        const emissionReduction = (suggestedReduction20 * carbonEmissionFactors.inputs.plasticFilm * formData.area * 1.2).toFixed(0);
        
        suggestions.push({
            priority: 'high',
            category: '农膜优化',
            title: '农膜排放偏高',
            description: `农膜全生命周期排放占比${plasticPercent.toFixed(1)}%（含生产、废弃阶段），是设施蔬菜第二大排放源。`,
            actions: [
                `减少20%用量 → 从${currentPlastic}降至${Math.round(currentPlastic * 0.80)}公斤/亩，可减排${emissionReduction} kg CO₂e`,
                '使用可降解农膜替代普通PE膜（可降排40-60%）',
                '选用薄型农膜（如0.008mm替代0.014mm），减少15-20%用量',
                '加强农膜回收利用，建立完善的回收体系',
                '推广多层覆盖改双层覆盖，减少用膜量',
                '使用环境友好型覆盖材料（如稻草覆盖）替代部分农膜'
            ],
            expectedReduction: `可减排${emissionReduction} kg CO₂e（使用可降解农膜可降排40-60%）`,
            color: '#e74c3c'
        });
    }
    
    if (dieselPercent > 6) {
        const suggestedReduction = Math.round(currentDiesel * 0.15);
        const emissionReduction = (suggestedReduction * carbonEmissionFactors.inputs.diesel * formData.area).toFixed(0);
        
        suggestions.push({
            priority: 'medium',
            category: '农机节能',
            title: '柴油消耗可优化',
            description: `柴油排放占比${dieselPercent.toFixed(1)}%，主要是农机作业消耗。`,
            actions: [
                `减少15%用量 → 从${currentDiesel}降至${Math.round(currentDiesel * 0.85)}升/亩，可减排${emissionReduction} kg CO₂e`,
                '采用复式作业，减少耕作次数',
                '使用节能型农机具，更换老旧高耗能设备',
                '推广电动农机具，替代柴油机械',
                '优化作业路线，减少空转时间',
                '使用精准农业技术，进行变量作业'
            ],
            expectedReduction: `可减排${emissionReduction} kg CO₂e`,
            color: '#f39c12'
        });
    }
    
    if (irrigationPercent > 5) {
        const suggestedReductionWater = Math.round(currentIrrigation * 0.25);
        const suggestedReductionEnergy = (suggestedReductionWater * carbonEmissionFactors.irrigation.energyPerM3 / carbonEmissionFactors.irrigation.pumpEfficiency * carbonEmissionFactors.regions[formData.region].electricityFactor * formData.area).toFixed(0);
        
        suggestions.push({
            priority: 'medium',
            category: '灌溉节能',
            title: '灌溉能耗可降低',
            description: `灌溉用电排放占比${irrigationPercent.toFixed(1)}%，主要来自抽水和提水能耗。`,
            actions: [
                `方案一：节水25% → 从${currentIrrigation}降至${Math.round(currentIrrigation * 0.75)}立方米/亩，可减排${suggestedReductionEnergy} kg CO₂e`,
                '采用滴灌技术（节水30-50%，节能20-30%）',
                '使用微喷灌替代大水漫灌',
                '安装变频泵，根据需求调节功率',
                '利用智能灌溉系统，实现精准控制',
                '利用夜间低谷电价抽水蓄水，降低用电成本',
                '收集利用雨水，减少地下水抽取'
            ],
            expectedReduction: `可减排${suggestedReductionEnergy} kg CO₂e（综合可降排20-30%）`,
            color: '#f39c12'
        });
    }
    
    if (pesticidePercent > 5) {
        suggestions.push({
            priority: 'medium',
            category: '农药减量',
            title: '农药使用可优化',
            description: `农药排放占比${pesticidePercent.toFixed(1)}%，农药生产过程碳排放较高。`,
            actions: [
                `从${currentPesticide}公斤/亩减量使用`,
                '推广生物防治技术，减少化学农药使用',
                '使用高效低毒农药，减少用药次数',
                '采用精准施药技术（如无人机喷雾）提高利用率',
                '轮作换茬，减少病虫害发生',
                '选用抗病虫品种，从源头减少用药需求'
            ],
            expectedReduction: `可减少农药用量20-30%`,
            color: '#f39c12'
        });
    }
    
    if (suggestions.length === 0 || suggestions.every(s => s.priority === 'low')) {
        suggestions.push({
            priority: 'low',
            category: '总体评价',
            title: '碳排放水平良好',
            description: `当前碳排放(${perHa.toFixed(0)} kg CO₂e/公顷)处于合理范围(${benchmark.tomatoRangeMin}~${benchmark.tomatoRangeMax} kg CO₂e/公顷)，继续保持！`,
            actions: [
                '继续保持当前良好的生产管理 practices',
                '定期监测土壤和植株营养状况',
                '关注新技术和新品种，持续优化',
                '可探索种养结合循环农业模式'
            ],
            expectedReduction: `当前已处于良好水平，继续保持即可`,
            color: '#27ae60'
        });
    }
    
    suggestions.push({
        priority: 'info',
        category: '长效措施',
        title: '长期低碳发展建议',
        description: '除了短期减排措施，建议从长远角度考虑以下综合措施：',
        actions: [
            '建设光伏农业设施，利用太阳能发电抵消部分能耗',
            '探索种养结合模式，实现资源循环利用',
            '建立碳汇档案，记录和监测碳排放变化',
            '参与碳交易市场，将减排放转化为经济效益',
            '申请绿色食品认证，提升产品附加值',
            '关注政策动态，争取农业绿色补贴'
        ],
        expectedReduction: `长期可实现碳中和或负排放`,
        color: '#3498db'
    });
    
    return suggestions;
}

function displayResults(results) {
    const resultsContainer = document.getElementById('results');
    
    const totalEmission = parseFloat(results.totalEmission);
    const perHa = parseFloat(results.emissionPerHa);
    const carbonIntensity = parseFloat(results.carbonIntensity);
    let emissionLevel = '';
    let emissionColor = '';
    
    if (perHa < 6000) {
        emissionLevel = '低碳排放';
        emissionColor = '#27ae60';
    } else if (perHa < 10000) {
        emissionLevel = '中等排放';
        emissionColor = '#f39c12';
    } else {
        emissionLevel = '高碳排放';
        emissionColor = '#e74c3c';
    }
    
    const benchmark = carbonEmissionFactors.benchmark;
    const comparedToIntensity = ((carbonIntensity - benchmark.northTomatoCarbonIntensity) / benchmark.northTomatoCarbonIntensity * 100).toFixed(1);
    const intensityStatus = carbonIntensity < benchmark.northTomatoCarbonIntensity ? '低于' : '高于';
    
    const fertilizerPercent = results.emissionBreakdown.fertilizer > 0 ? (results.emissionBreakdown.fertilizer / totalEmission * 100).toFixed(1) : '0';
    const plasticPercent = results.emissionBreakdown.plasticFilm > 0 ? (results.emissionBreakdown.plasticFilm / totalEmission * 100).toFixed(1) : '0';
    const energyPercent = results.emissionBreakdown.diesel > 0 ? ((results.emissionBreakdown.diesel + results.emissionBreakdown.irrigation) / totalEmission * 100).toFixed(1) : '0';
    const pesticidePercent = results.emissionBreakdown.pesticide > 0 ? (results.emissionBreakdown.pesticide / totalEmission * 100).toFixed(1) : '0';
    const n2oPercent = results.emissionBreakdown.n2o > 0 ? (results.emissionBreakdown.n2o / totalEmission * 100).toFixed(1) : '0';
    
    const suggestions = generateImprovementSuggestions(results);
    
    let suggestionsHTML = '<div class="result-item"><h3>减排改进建议（' + suggestions.length + '条）</h3><div class="result-details" style="grid-template-columns: 1fr;">';
    suggestions.forEach((suggestion, index) => {
        const priorityBadge = suggestion.priority === 'high' ? '高优先级' : suggestion.priority === 'medium' ? '中优先级' : suggestion.priority === 'info' ? '参考信息' : '正常';
        const priorityColor = suggestion.priority === 'high' ? '#e74c3c' : suggestion.priority === 'medium' ? '#f39c12' : suggestion.priority === 'info' ? '#3498db' : '#27ae60';
        const categoryIcon = suggestion.category === '化肥优化' ? '🧪' : 
                            suggestion.category === '农膜优化' ? '🌿' : 
                            suggestion.category === '灌溉节能' ? '💧' : 
                            suggestion.category === '农机节能' ? '🚜' : 
                            suggestion.category === '土壤排放' ? '🌍' : 
                            suggestion.category === '农药减量' ? '🐛' : 
                            suggestion.category === '整体评估' ? '📊' : 
                            suggestion.category === '碳强度' ? '⚡' : 
                            suggestion.category === '长效措施' ? '🎯' : '💡';
        
        suggestionsHTML += `
            <div style="background: ${suggestion.color}10; border-left: 4px solid ${suggestion.color}; padding: 15px; margin-bottom: 15px; border-radius: 8px;">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
                    <span style="font-weight: 600; color: ${suggestion.color}; font-size: 1.1em;">${categoryIcon} ${suggestion.title}</span>
                    <span style="padding: 4px 10px; background: ${priorityColor}20; color: ${priorityColor}; border-radius: 12px; font-size: 12px; font-weight: 500;">${priorityBadge}</span>
                </div>
                <p style="color: #4b5563; font-size: 0.95em; margin-bottom: 12px;">${suggestion.description}</p>
                <div style="background: white; padding: 12px; border-radius: 6px; margin-bottom: 10px;">
                    <span style="font-weight: 600; color: #1f2937; font-size: 0.9em;">具体措施：</span>
                    <ul style="margin: 8px 0 0 0; padding-left: 20px; color: #374151;">
                        ${suggestion.actions.map(action => `<li style="margin-bottom: 4px;">${action}</li>`).join('')}
                    </ul>
                </div>
                ${suggestion.expectedReduction ? `<p style="color: #059669; font-size: 0.9em; font-weight: 600; margin-top: 8px;">� 预计效果：${suggestion.expectedReduction}</p>` : ''}
            </div>
        `;
    });
    suggestionsHTML += '</div></div>';
    
    const resultsHTML = `
        <div class="result-item" style="border-left: 5px solid ${emissionColor};">
            <h3>总碳排放量</h3>
            <div class="result-value" style="color: ${emissionColor};">${results.totalEmission}</div>
            <div class="result-unit">公斤CO₂当量（约${(totalEmission/1000).toFixed(2)}吨）</div>
            <div style="margin-top: 10px; padding: 8px; background: ${emissionColor}20; border-radius: 5px; color: ${emissionColor}; font-weight: 600;">
                ${emissionLevel}
            </div>
        </div>
        
        <div class="result-item">
            <h3>碳强度</h3>
            <div class="result-value">${results.carbonIntensity}</div>
            <div class="result-unit">公斤CO₂当量/吨产量</div>
            <div style="margin-top: 8px; font-size: 14px; color: #666;">
                北方日光温室番茄参考值：${benchmark.northTomatoCarbonIntensity} kg CO₂e/吨
            </div>
        </div>
        
        <div class="result-item">
            <h3>单位面积碳排放</h3>
            <div class="result-value">${results.emissionPerArea}</div>
            <div class="result-unit">公斤CO₂当量/亩</div>
            <div style="margin-top: 8px; font-size: 14px; color: #666;">
                合 ${results.emissionPerHa} 公斤CO₂当量/公顷
            </div>
        </div>
        
        <div class="result-item">
            <h3>碳排放构成分析</h3>
            <div class="result-details">
                <div class="detail-item">
                    <span class="detail-label">化肥生产排放</span>
                    <span class="detail-value">${results.emissionBreakdown.fertilizer.toFixed(2)} kg (${fertilizerPercent}%)</span>
                </div>
                <div class="detail-item">
                    <span class="detail-label">农田N₂O排放</span>
                    <span class="detail-value">${results.emissionBreakdown.n2o.toFixed(2)} kg (${n2oPercent}%)</span>
                </div>
                <div class="detail-item">
                    <span class="detail-label">农膜全生命周期排放</span>
                    <span class="detail-value">${results.emissionBreakdown.plasticFilm.toFixed(2)} kg (${plasticPercent}%)</span>
                </div>
                <div class="detail-item">
                    <span class="detail-label">机械柴油排放</span>
                    <span class="detail-value">${results.emissionBreakdown.diesel.toFixed(2)} kg CO₂</span>
                </div>
                <div class="detail-item">
                    <span class="detail-label">灌溉用电排放</span>
                    <span class="detail-value">${results.emissionBreakdown.irrigation.toFixed(2)} kg CO₂</span>
                </div>
                <div class="detail-item">
                    <span class="detail-label">农药生产排放</span>
                    <span class="detail-value">${results.emissionBreakdown.pesticide.toFixed(2)} kg (${pesticidePercent}%)</span>
                </div>
            </div>
        </div>
        
        <div class="result-item">
            <h3>权威基准对比</h3>
            <div class="result-details">
                <div class="detail-item">
                    <span class="detail-label">北方日光温室番茄碳强度</span>
                    <span class="detail-value">${benchmark.northTomatoCarbonIntensity} kg CO₂e/吨</span>
                </div>
                <div class="detail-item">
                    <span class="detail-label">与标准碳强度对比</span>
                    <span class="detail-value" style="${Math.abs(comparedToIntensity) > 15 ? (comparedToIntensity > 0 ? 'color: #e74c3c;' : 'color: #27ae60;') : ''}">
                        ${intensityStatus} ${Math.abs(comparedToIntensity)}%
                    </span>
                </div>
                <div class="detail-item">
                    <span class="detail-label">设施番茄全国平均</span>
                    <span class="detail-value">${benchmark.tomatoNationalAverage} kg CO₂e/公顷</span>
                </div>
                <div class="detail-item">
                    <span class="detail-label">设施番茄排放范围</span>
                    <span class="detail-value">${benchmark.tomatoRangeMin}~${benchmark.tomatoRangeMax} kg CO₂e/公顷</span>
                </div>
                <div class="detail-item">
                    <span class="detail-label">露地番茄平均排放</span>
                    <span class="detail-value">${benchmark.openFieldAverage} kg CO₂e/公顷</span>
                </div>
                <div class="detail-item">
                    <span class="detail-label">设施比露地排放高</span>
                    <span class="detail-value">87.85%</span>
                </div>
            </div>
        </div>
        
        ${suggestionsHTML}
        
        <div class="result-item">
            <h3>生产情况</h3>
            <div class="result-details">
                <div class="detail-item">
                    <span class="detail-label">作物类型</span>
                    <span class="detail-value">${results.cropName}（设施栽培）</span>
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
                    <span class="detail-value">${results.formData.yield} 公斤（${results.totalYieldTons} 吨）</span>
                </div>
                <div class="detail-item">
                    <span class="detail-label">亩产量</span>
                    <span class="detail-value">${results.yieldPerMu} 公斤/亩</span>
                </div>
            </div>
        </div>
        
        <div class="result-item">
            <h3>核算标准与规范</h3>
            <div class="result-details">
                <div class="detail-item">
                    <span class="detail-label">国家标准</span>
                    <span class="detail-value">${results.standards.nationalStandard}</span>
                </div>
                <div class="detail-item">
                    <span class="detail-label">团体标准（茄果类）</span>
                    <span class="detail-value">${results.standards.groupStandard}</span>
                </div>
                <div class="detail-item">
                    <span class="detail-label">团体标准（果蔬）</span>
                    <span class="detail-value">${results.standards.groupStandard2}</span>
                </div>
                <div class="detail-item">
                    <span class="detail-label">制定中国家标准</span>
                    <span class="detail-value">${results.standards.proposedStandard}</span>
                </div>
            </div>
        </div>
        
        <div class="result-item">
            <h3>数据来源（按优先级）</h3>
            <div class="result-details">
                ${results.dataPriority.map(item => `
                    <div class="detail-item">
                        <span class="detail-label">优先级${item.priority}</span>
                        <span class="detail-value">${item.source}</span>
                    </div>
                `).join('')}
            </div>
        </div>
    `;
    
    resultsContainer.innerHTML = resultsHTML;
}

document.addEventListener('DOMContentLoaded', function() {
    checkPassword();
    
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
});