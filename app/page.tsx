'use client';

import React, { useState, useEffect } from 'react';
import { PayPalButtons, PayPalScriptProvider } from '@paypal/react-paypal-js';

interface PokemonStats {
  baseAttack: number;
  baseDefense: number;
  baseSpeed: number;
  baseHP: number;
  baseSpAttack: number;
  baseSpDefense: number;
}

const POKEMON_PRESETS: Record<string, PokemonStats> = {
  machamp: {
    baseAttack: 130,
    baseDefense: 80,
    baseSpeed: 55,
    baseHP: 90,
    baseSpAttack: 65,
    baseSpDefense: 80
  },
  megaDragonite: {
    baseAttack: 140,
    baseDefense: 120,
    baseSpeed: 100,
    baseHP: 91,
    baseSpAttack: 100,
    baseSpDefense: 100
  }
};

// 热门对手数据
const POPULAR_OPPONENTS: Record<string, PokemonStats> = {
  garchomp: {
    baseAttack: 130,
    baseDefense: 95,
    baseSpeed: 102,
    baseHP: 108,
    baseSpAttack: 80,
    baseSpDefense: 85
  },
  mamoswine: {
    baseAttack: 130,
    baseDefense: 80,
    baseSpeed: 80,
    baseHP: 110,
    baseSpAttack: 70,
    baseSpDefense: 60
  },
  ferrothorn: {
    baseAttack: 94,
    baseDefense: 131,
    baseSpeed: 20,
    baseHP: 74,
    baseSpAttack: 54,
    baseSpDefense: 116
  }
};

function calculateStat(baseStat: number, sp: number): number {
  // IV固定为31，SP转换为EV（1 SP = 8 EV）
  const ev = sp * 8;
  return Math.floor((2 * baseStat + 31 + ev / 4) * 0.9); // 假设等级为50
}

function calculateDamage(
  baseAttack: number,
  attackSp: number,
  movePower: number,
  baseDefense: number,
  defenseSp: number,
  terrainBoost: boolean,
  piercingDrill: boolean,
  thermalBoost: boolean,
  dragonize: boolean
): [number, number] {
  const attack = calculateStat(baseAttack, attackSp);
  const defense = calculateStat(baseDefense, defenseSp);
  
  let damage = (2 * 50 / 5 + 2) * movePower * attack / defense / 50 + 2;
  
  // 应用修正系数
  if (terrainBoost) damage *= 1.3;
  if (piercingDrill) damage *= 0.25;
  if (thermalBoost) damage *= 1.5;
  if (dragonize) damage *= 1.2;
  
  // 伤害区间（85%-100%）
  const minDamage = Math.floor(damage * 0.85);
  const maxDamage = Math.floor(damage);
  
  return [minDamage, maxDamage];
}

function calculateSpeed(baseSpeed: number, speedSp: number): number {
  return calculateStat(baseSpeed, speedSp);
}

function calculateHP(baseHP: number, hpSp: number): number {
  return calculateStat(baseHP, hpSp);
}

// 计算最优SP分配方案
function calculateOptimalSpAllocation(
  baseAttack: number,
  baseDefense: number,
  baseHP: number,
  movePower: number,
  terrainBoost: boolean,
  piercingDrill: boolean,
  thermalBoost: boolean,
  dragonize: boolean
): { attackSp: number; defenseSp: number; hpSp: number; OHKOOpponents: string[] } {
  let minAttackSp = 0;
  const OHKOOpponents: string[] = [];
  
  // 计算对每个热门对手的最小攻击SP需求
  Object.entries(POPULAR_OPPONENTS).forEach(([name, opponent]) => {
    // 计算对手的HP（假设对手分配252 HP EV，即32 SP）
    const opponentHP = calculateHP(opponent.baseHP, 32);
    
    // 寻找最小的攻击SP，使得能够OHKO对手
    for (let sp = 0; sp <= 32; sp++) {
      const [minDamage] = calculateDamage(
        baseAttack,
        sp,
        movePower,
        opponent.baseDefense,
        0, // 假设对手0防御SP
        terrainBoost,
        piercingDrill,
        thermalBoost,
        dragonize
      );
      
      if (minDamage >= opponentHP) {
        if (sp > minAttackSp) {
          minAttackSp = sp;
        }
        OHKOOpponents.push(name);
        break;
      }
    }
  });
  
  // 计算剩余的SP
  const remainingSp = 66 - minAttackSp;
  // 将剩余SP平均分配到防御和HP上
  const defenseSp = Math.floor(remainingSp / 2);
  const hpSp = remainingSp - defenseSp;
  
  return {
    attackSp: minAttackSp,
    defenseSp,
    hpSp,
    OHKOOpponents
  };
}

export default function PokemonDamageCalculator() {
  const [pokemon, setPokemon] = useState<string>('');
  const [baseAttack, setBaseAttack] = useState<number>(100);
  const [baseDefense, setBaseDefense] = useState<number>(100);
  const [baseSpeed, setBaseSpeed] = useState<number>(100);
  const [movePower, setMovePower] = useState<number>(80);
  const [attackSp, setAttackSp] = useState<number>(0);
  const [defenseSp, setDefenseSp] = useState<number>(0);
  const [speedSp, setSpeedSp] = useState<number>(0);
  const [remainingSp, setRemainingSp] = useState<number>(66);
  const [terrainBoost, setTerrainBoost] = useState<boolean>(false);
  const [piercingDrill, setPiercingDrill] = useState<boolean>(false);
  const [thermalBoost, setThermalBoost] = useState<boolean>(false);
  const [dragonize, setDragonize] = useState<boolean>(false);
  const [damageRange, setDamageRange] = useState<[number, number]>([0, 0]);
  const [finalSpeed, setFinalSpeed] = useState<number>(0);
  const [optimalSpConfig, setOptimalSpConfig] = useState<{
    attackSp: number;
    defenseSp: number;
    hpSp: number;
    OHKOOpponents: string[];
  }>({ attackSp: 0, defenseSp: 0, hpSp: 0, OHKOOpponents: [] });
  const [isPaid, setIsPaid] = useState<boolean>(false);
  const [randomLink, setRandomLink] = useState<string>('');
  
  // 二级域名站点链接数组
  const wangdadiLinks = [
    'https://noseotop.vercel.app/',
    'https://nukeprivacy.wangdadi.xyz',
    'https://killbillcard.wangdadi.xyz/',
    'https://zerocloud.wangdadi.xyz',
    'https://focusinbox-eight.wangdadi.xyz',
    'https://saaskiller.wangdadi.xyz',
    'https://noaimd.wangdadi.xyz',
    'https://crosspostfast.wangdadi.xyz',
    'https://killswitchapi.wangdadi.xyz',
    'https://pingthemio.wangdadi.xyz',
    'https://neveruploadio.wangdadi.xyz/',
    'https://cleancsvai.wangdadi.xyz',
    'https://saasstripper.wangdadi.xyz',
    'https://noadobe.wangdadi.xyz',
    'https://navslayer.wangdadi.xyz',
    'https://killsaas.wangdadi.xyz',
    'https://slimsnd.wangdadi.xyz',
    'https://boothell.wangdadi.xyz',
    'https://linguisticdnaextractor.wangdadi.xyz/',
    'https://humbled.wangdadi.xyz/',
    'https://stopsaas.wangdadi.xyz',
    'https://oneclickapi.wangdadi.xyz/',
    'https://stopaicost.wangdadi.xyz',
    'https://smesurvivalai.wangdadi.xyz/',
    'https://onecommand.wangdadi.xyz/',
    'https://killsubscription.wangdadi.xyz/',
    'https://manualslib.wangdadi.xyz/',
    'https://billripper.wangdadi.xyz/',
    'https://deadliner.wangdadi.xyz/',
    'https://zerosub.wangdadi.xyz/',
    'https://mockupnuke.wangdadi.xyz/',
    'https://scriptkill.wangdadi.xyz/',
    'https://viralhook.wangdadi.xyz/',
    'https://onepagesaas.wangdadi.xyz/',
    'https://cineskin.wangdadi.xyz/',
    'https://office-sync.wangdadi.xyz/',
    'https://brainbridge.wangdadi.xyz/',
    'https://personalock.wangdadi.xyz/',
    'https://neverexplain.wangdadi.xyz/'
  ];

  useEffect(() => {
    const totalSp = attackSp + defenseSp + speedSp;
    setRemainingSp(66 - totalSp);
  }, [attackSp, defenseSp, speedSp]);

  useEffect(() => {
    const damage = calculateDamage(
      baseAttack,
      attackSp,
      movePower,
      baseDefense,
      defenseSp,
      terrainBoost,
      piercingDrill,
      thermalBoost,
      dragonize
    );
    setDamageRange(damage);
  }, [baseAttack, attackSp, movePower, baseDefense, defenseSp, terrainBoost, piercingDrill, thermalBoost, dragonize]);

  useEffect(() => {
    const speed = calculateSpeed(baseSpeed, speedSp);
    setFinalSpeed(speed);
  }, [baseSpeed, speedSp]);

  useEffect(() => {
    // 获取当前宝可梦的基础HP
    let baseHP = 100; // 默认值
    if (pokemon && POKEMON_PRESETS[pokemon]) {
      baseHP = POKEMON_PRESETS[pokemon].baseHP;
    }
    
    const config = calculateOptimalSpAllocation(
      baseAttack,
      baseDefense,
      baseHP,
      movePower,
      terrainBoost,
      piercingDrill,
      thermalBoost,
      dragonize
    );
    setOptimalSpConfig(config);
  }, [baseAttack, baseDefense, movePower, terrainBoost, piercingDrill, thermalBoost, dragonize, pokemon]);

  useEffect(() => {
    // 从localStorage中读取支付状态
    const paidStatus = localStorage.getItem('pokemonCalcPaid');
    if (paidStatus === 'true') {
      setIsPaid(true);
    }
  }, []);

  useEffect(() => {
    // 只在客户端执行，避免hydration mismatch
    if (typeof window !== 'undefined') {
      const randomIndex = Math.floor(Math.random() * wangdadiLinks.length);
      setRandomLink(wangdadiLinks[randomIndex]);
    }
  }, []);

  const handlePresetSelect = (preset: string) => {
    const stats = POKEMON_PRESETS[preset];
    if (stats) {
      setPokemon(preset);
      setBaseAttack(stats.baseAttack);
      setBaseDefense(stats.baseDefense);
      setBaseSpeed(stats.baseSpeed);
      // 重置SP分配
      setAttackSp(0);
      setDefenseSp(0);
      setSpeedSp(0);
    }
  };

  const handlePaymentSuccess = (details: any) => {
    console.log('Payment successful:', details);
    setIsPaid(true);
    // 存储支付状态到localStorage
    localStorage.setItem('pokemonCalcPaid', 'true');
  };

  return (
    <PayPalScriptProvider options={{
      clientId: 'test',
      currency: 'USD',
      components: 'buttons',
      disableFunding: 'credit,card,p24,bancontact,blik,eps,giropay,ideal,mybank,paybright,paysafecard,sofort'
    }}>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4 md:p-8">
        <div className="max-w-2xl mx-auto bg-white rounded-xl shadow-lg p-6">
          <h1 className="text-2xl md:text-3xl font-bold text-center text-indigo-800 mb-6">
            Pokémon Champions Regulation X Damage Calculator
          </h1>

        {/* Preset Selection */}
        <div className="flex flex-col md:flex-row gap-4 mb-8">
          <button
            onClick={() => handlePresetSelect('machamp')}
            className="flex-1 bg-red-500 hover:bg-red-600 text-white py-2 px-4 rounded-lg transition-colors"
          >
            One-click Machamp Setup
          </button>
          <button
            onClick={() => handlePresetSelect('megaDragonite')}
            className="flex-1 bg-purple-500 hover:bg-purple-600 text-white py-2 px-4 rounded-lg transition-colors"
          >
            One-click Mega Dragonite Setup
          </button>
        </div>

        {/* Base Stats Input */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Base Attack</label>
            <input
              type="number"
              value={baseAttack}
              onChange={(e) => setBaseAttack(Number(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Base Defense</label>
            <input
              type="number"
              value={baseDefense}
              onChange={(e) => setBaseDefense(Number(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Base Speed</label>
            <input
              type="number"
              value={baseSpeed}
              onChange={(e) => setBaseSpeed(Number(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Move Power */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-1">Move Power</label>
          <input
            type="number"
            value={movePower}
            onChange={(e) => setMovePower(Number(e.target.value))}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          />
        </div>

        {/* SP Allocation */}
        <div className="mb-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-3">SP Allocation (Total 66 Points)</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Attack SP</label>
              <input
                type="number"
                min="0"
                max="32"
                value={attackSp}
                onChange={(e) => setAttackSp(Math.min(32, Number(e.target.value)))}  
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Defense SP</label>
              <input
                type="number"
                min="0"
                max="32"
                value={defenseSp}
                onChange={(e) => setDefenseSp(Math.min(32, Number(e.target.value)))}  
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Speed SP</label>
              <input
                type="number"
                min="0"
                max="32"
                value={speedSp}
                onChange={(e) => setSpeedSp(Math.min(32, Number(e.target.value)))}  
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
            </div>
          </div>
          <div className="mt-2 text-sm text-gray-600">
            Remaining SP: {remainingSp}
          </div>
        </div>

        {/* Modifiers */}
        <div className="mb-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-3">Modifiers</h2>
          <div className="space-y-2">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={terrainBoost}
                onChange={(e) => setTerrainBoost(e.target.checked)}
                className="mr-2"
              />
              Terrain Boost (1.3x)
            </label>
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={piercingDrill}
                onChange={(e) => setPiercingDrill(e.target.checked)}
                className="mr-2"
              />
              Piercing Drill (0.25x)
            </label>
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={thermalBoost}
                onChange={(e) => setThermalBoost(e.target.checked)}
                className="mr-2"
              />
              Thermal Boost (1.5x)
            </label>
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={dragonize}
                onChange={(e) => setDragonize(e.target.checked)}
                className="mr-2"
              />
              Dragonize (1.2x)
            </label>
          </div>
        </div>

        {/* Results and Optimal SP Configuration */}
        <div className={`mt-8 relative ${!isPaid ? 'blur-md' : ''}`}>
          <div className="bg-indigo-50 p-4 rounded-lg mb-4">
            <h2 className="text-lg font-semibold text-indigo-800 mb-2">Damage Range</h2>
            <p className="text-2xl font-bold text-center">{damageRange[0]} - {damageRange[1]}</p>
          </div>
          <div className="bg-blue-50 p-4 rounded-lg">
            <h2 className="text-lg font-semibold text-blue-800 mb-2">Speed Tier</h2>
            <p className="text-2xl font-bold text-center">{finalSpeed}</p>
          </div>

          {/* Optimal SP Configuration */}
          <div className="mt-8 bg-green-50 p-4 rounded-lg">
            <h2 className="text-lg font-semibold text-green-800 mb-3">Optimal SP Configuration</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <div className="bg-white p-3 rounded-lg shadow-sm">
                <h3 className="text-sm font-medium text-gray-700 mb-1">Attack SP</h3>
                <p className="text-xl font-bold text-center">{optimalSpConfig.attackSp}</p>
              </div>
              <div className="bg-white p-3 rounded-lg shadow-sm">
                <h3 className="text-sm font-medium text-gray-700 mb-1">Defense SP</h3>
                <p className="text-xl font-bold text-center">{optimalSpConfig.defenseSp}</p>
              </div>
              <div className="bg-white p-3 rounded-lg shadow-sm">
                <h3 className="text-sm font-medium text-gray-700 mb-1">HP SP</h3>
                <p className="text-xl font-bold text-center">{optimalSpConfig.hpSp}</p>
              </div>
            </div>
            <div className="mt-4">
              <h3 className="text-sm font-medium text-gray-700 mb-2">Can OHKO:</h3>
              <div className="flex flex-wrap gap-2">
                {optimalSpConfig.OHKOOpponents.length > 0 ? (
                  optimalSpConfig.OHKOOpponents.map((opponent) => (
                    <span key={opponent} className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm">
                      {opponent}
                    </span>
                  ))
                ) : (
                  <span className="text-gray-500 text-sm">Cannot OHKO any popular opponents</span>
                )}
              </div>
            </div>
          </div>

          {/* Payment Wall */}
          {!isPaid && (
            <div className="absolute inset-0 bg-white bg-opacity-90 flex items-center justify-center rounded-lg p-6">
              <div className="text-center max-w-md">
                <h2 className="text-xl font-bold text-gray-800 mb-4">Unlock Pro Calculations</h2>
                <p className="text-gray-600 mb-6">Pay $1.99 for pro tournament calculations and optimal SP allocation recommendations</p>
                <PayPalButtons
                  createOrder={(data, actions) => {
                    return actions.order.create({
                      purchase_units: [{
                        amount: {
                          value: '1.99'
                        },
                        description: 'Pokémon Champions Reg X Calc Pro Access'
                      }]
                    });
                  }}
                  onApprove={(data, actions) => {
                    return actions.order.capture().then((details: any) => {
                      handlePaymentSuccess(details);
                    });
                  }}
                  style={{
                    layout: 'vertical',
                    color: 'gold',
                    shape: 'rect',
                    label: 'paypal'
                  }}
                />
                <p className="mt-4 text-sm text-gray-500">Secure payment via PayPal. Digital access only.</p>
              </div>
            </div>
          )}
        </div>

        {/* Core Logic Explanation */}
        <div className="mt-8 text-sm text-gray-600 bg-gray-50 p-4 rounded-lg">
          <h3 className="font-semibold mb-2">Core Logic:</h3>
          <ul className="list-disc pl-5 space-y-1">
            <li>IV fixed at 31</li>
            <li>1 SP = 8 EVs, max 32 SP per stat, total 66 SP</li>
            <li>Terrain Boost: 1.3x</li>
            <li>Piercing Drill: 0.25x (pierces Protect)</li>
            <li>Thermal Boost: 1.5x (Fire type)</li>
            <li>Dragonize: Normal to Dragon type + 1.2x power</li>
            <li>Enhanced Bad Dreams: 25% HP loss per turn while sleeping</li>
          </ul>
        </div>

        {/* Random Link Display */}
        <div className="mt-8 text-center">
          <p className="text-sm text-gray-500 mb-2">Recommended Site:</p>
          {randomLink && (
            <a 
              href={randomLink} 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-blue-600 hover:text-blue-800 font-medium"
            >
              {randomLink}
            </a>
          )}
        </div>

        {/* Footer */}
        <div className="mt-12 text-center text-sm text-gray-500">
          <p>Support: 457239850@qq.com</p>
        </div>
      </div>
    </div>
    </PayPalScriptProvider>
  );
}
