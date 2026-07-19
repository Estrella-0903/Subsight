import Database from 'better-sqlite3';
import bcrypt from 'bcryptjs';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here=path.dirname(fileURLToPath(import.meta.url));
const dataDir=path.join(here,'data');
fs.mkdirSync(dataDir,{recursive:true});
export const db=new Database(path.join(dataDir,'subsight.db'));
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

db.exec(`
CREATE TABLE IF NOT EXISTS users(id INTEGER PRIMARY KEY AUTOINCREMENT,email TEXT UNIQUE NOT NULL,password_hash TEXT NOT NULL,name TEXT NOT NULL,role TEXT NOT NULL DEFAULT 'enterprise',created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP);
CREATE TABLE IF NOT EXISTS enterprises(id INTEGER PRIMARY KEY AUTOINCREMENT,user_id INTEGER UNIQUE NOT NULL,name TEXT NOT NULL,credit_code TEXT,region TEXT,industry TEXT,founded_at TEXT,employees INTEGER,revenue REAL,rd_investment REAL,rd_people INTEGER,invention_patents INTEGER,utility_patents INTEGER,software_copyrights INTEGER,profile_json TEXT NOT NULL DEFAULT '{}',updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,FOREIGN KEY(user_id) REFERENCES users(id));
CREATE TABLE IF NOT EXISTS policies(id TEXT PRIMARY KEY,title TEXT NOT NULL,policy_number TEXT,department TEXT,level TEXT,region TEXT,category TEXT,support_type TEXT,support_range TEXT,publish_date TEXT,start_date TEXT,deadline TEXT,official_url TEXT,summary TEXT,requirements_json TEXT NOT NULL DEFAULT '[]',materials_json TEXT NOT NULL DEFAULT '[]',match_score INTEGER NOT NULL DEFAULT 0,official_source TEXT,updated_at TEXT,status TEXT);
CREATE TABLE IF NOT EXISTS favorites(user_id INTEGER NOT NULL,policy_id TEXT NOT NULL,created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,PRIMARY KEY(user_id,policy_id),FOREIGN KEY(user_id) REFERENCES users(id),FOREIGN KEY(policy_id) REFERENCES policies(id));
CREATE TABLE IF NOT EXISTS applications(id INTEGER PRIMARY KEY AUTOINCREMENT,user_id INTEGER NOT NULL,policy_id TEXT NOT NULL,project_name TEXT NOT NULL,status TEXT NOT NULL,progress INTEGER NOT NULL DEFAULT 0,material_progress INTEGER NOT NULL DEFAULT 0,notes TEXT NOT NULL DEFAULT '',updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,FOREIGN KEY(user_id) REFERENCES users(id),FOREIGN KEY(policy_id) REFERENCES policies(id));
`);

const user=db.prepare('SELECT id FROM users WHERE email=?').get('demo@subsight.cn');
let userId=user?.id;
if(!userId){const result=db.prepare('INSERT INTO users(email,password_hash,name) VALUES(?,?,?)').run('demo@subsight.cn',bcrypt.hashSync('Demo123456',10),'张经理');userId=Number(result.lastInsertRowid);}
db.prepare(`INSERT OR IGNORE INTO enterprises(user_id,name,credit_code,region,industry,founded_at,employees,revenue,rd_investment,rd_people,invention_patents,utility_patents,software_copyrights) VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?)`).run(userId,'苏州智造科技有限公司','91320594MA27ABC123','苏州工业园区','智能装备制造','2021-06',68,1800,230,16,3,8,4);

const policySeeds=[
['1','苏州市智能制造示范工厂建设项目','苏工信〔2026〕11号','苏州市工业和信息化局','市级','苏州工业园区','智能制造','项目补助','按有效投入比例给予支持，最高 500 万元',92],
['2','工业企业技术改造综合奖补','苏技改〔2026〕12号','苏州市工业和信息化局','市级','苏州市','技术改造','奖励','最高 100 万元',88],
['3','高新技术企业认定奖励','苏高企〔2026〕13号','苏州市科学技术局','市级','苏州工业园区','高新技术企业','项目补助','最高 500 万元',84],
['4','科技型中小企业研发投入补助','苏科技〔2026〕14号','苏州市科学技术局','市级','苏州市','科技型中小企业','奖励','最高 100 万元',86],
['5','专精特新中小企业培育项目','苏专精〔2026〕15号','苏州市工业和信息化局','区级','苏州工业园区','专精特新','项目补助','最高 50 万元',74],
['6','企业研发费用增长奖励','苏研发〔2026〕16号','苏州市科学技术局','市级','苏州市','研发费用','奖励','最高 100 万元',79],
['7','高价值知识产权培育计划','苏知产〔2026〕17号','苏州市市场监督管理局','区级','苏州工业园区','知识产权','项目补助','最高 50 万元',68],
['8','重点产业紧缺人才计划','苏人才〔2026〕18号','苏州市人社局','市级','苏州市','人才招聘','奖励','最高 30 万元',61],
['9','中小企业数字化转型专项','苏数字〔2026〕19号','苏州市工业和信息化局','省级','苏州工业园区','数字化转型','项目补助','最高 500 万元',90],
['10','绿色制造体系建设奖励','苏绿色〔2026〕20号','苏州市工业和信息化局','市级','苏州市','绿色制造','奖励','最高 100 万元',72],
['11','企业出海参展支持计划','苏商务〔2026〕21号','苏州市商务局','区级','苏州工业园区','出海参展','项目补助','最高 30 万元',58],
['12','科技创业孵化扶持计划','苏创业〔2026〕22号','园区科创委','省级','苏州市','创业扶持','奖励','最高 50 万元',47]
];
const insertPolicy=db.prepare(`INSERT OR IGNORE INTO policies(id,title,policy_number,department,level,region,category,support_type,support_range,publish_date,start_date,deadline,official_url,summary,requirements_json,materials_json,match_score,official_source,updated_at,status) VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`);
const seedTransaction=db.transaction(()=>{for(const p of policySeeds)insertPolicy.run(...p.slice(0,9),'2026-06-18','2026-07-01','2026-08-25','#mock-official',`支持符合条件的${p[6]}企业开展项目建设。`,JSON.stringify(['在苏州市依法登记并持续经营','具有健全财务制度','项目符合政策方向','近三年无重大失信']),JSON.stringify(['营业执照','项目申报书','财务报表','项目合同']),p[9],'主管部门公开政策页面（Mock）','2026-07-16','申报中');});seedTransaction();
db.prepare(`INSERT OR IGNORE INTO applications(id,user_id,policy_id,project_name,status,progress,material_progress,notes) VALUES(1,?,?,?,?,?,?,?)`).run(userId,'1','智能制造示范工厂升级项目','材料待补充',64,72,'Demo 申报项目');

export function mapPolicy(row){return {id:row.id,title:row.title,policyNumber:row.policy_number,department:row.department,level:row.level,region:row.region,category:row.category,supportType:row.support_type,supportRange:row.support_range,publishDate:row.publish_date,startDate:row.start_date,deadline:row.deadline,officialUrl:row.official_url,summary:row.summary,requirements:JSON.parse(row.requirements_json),requiredMaterials:JSON.parse(row.materials_json),matchScore:row.match_score,matchedConditions:['注册区域符合','经营状态正常','项目方向匹配'],unmatchedConditions:row.match_score<70?['部分资质年限暂未满足']:[],pendingConditions:['最新纳税证明待核验'],officialSource:row.official_source,updatedAt:row.updated_at,status:row.status};}
