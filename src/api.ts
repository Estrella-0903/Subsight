import type {Policy} from './types';
import {enterprise,policies} from './data';

const TOKEN_KEY='subsight-auth-token';
export const authStore={
  get:()=>localStorage.getItem(TOKEN_KEY),
  set:(token:string,user:unknown)=>{localStorage.setItem(TOKEN_KEY,token);localStorage.setItem('subsight-user',JSON.stringify(user))},
  clear:()=>{localStorage.removeItem(TOKEN_KEY);localStorage.removeItem('subsight-user')},
  user:()=>{try{return JSON.parse(localStorage.getItem('subsight-user')||'null')}catch{return null}}
};

async function request<T>(url:string,options:RequestInit={}):Promise<T>{
  const token=authStore.get();
  const res=await fetch(`/api${url}`,{...options,headers:{'Content-Type':'application/json',...(token?{Authorization:`Bearer ${token}`}:{}) ,...options.headers}});
  const data=await res.json().catch(()=>({}));
  if(res.status===401&&url!=='/auth/login')authStore.clear();
  if(!res.ok)throw new Error(data.message||'服务请求失败');
  return data as T;
}

type LoginResult={token:string;user:{id:number;email:string;name:string;role:string}};
type BackendEnterprise={name:string;region:string;industry:string;founded_at:string;employees:number;revenue:number;rd_investment:number;rd_people:number;invention_patents:number;utility_patents:number;software_copyrights:number};

async function hydrateFromDatabase(){
  try{
    const [policyResult,company]=await Promise.all([
      request<{items:Policy[]}>('/policies'),
      request<BackendEnterprise>('/enterprise')
    ]);
    policies.splice(0,policies.length,...policyResult.items);
    Object.assign(enterprise,{name:company.name,region:company.region,industry:company.industry,founded:company.founded_at.replace('-',' 年 ')+' 月',employees:company.employees,revenue:`${company.revenue.toLocaleString()} 万元`,rd:`${company.rd_investment} 万元`,rdPeople:company.rd_people,invention:company.invention_patents,utility:company.utility_patents,copyright:company.software_copyrights});
  }catch(error){
    console.warn('后端业务数据暂不可用，继续使用内置演示数据。',error);
  }
}

export const api={
  login:async(email:string,password:string)=>{const result=await request<LoginResult>('/auth/login',{method:'POST',body:JSON.stringify({email,password})});authStore.set(result.token,result.user);await hydrateFromDatabase();return result},
  me:()=>request<{user:unknown}>('/auth/me'),
  policies:()=>request<{items:Policy[]}>('/policies'),
  enterprise:()=>request<BackendEnterprise>('/enterprise'),
  saveEnterprise:(data:unknown)=>request<{ok:boolean}>('/enterprise',{method:'PUT',body:JSON.stringify(data)}),
  applications:()=>request<{items:unknown[]}>('/applications'),
  hydrate:hydrateFromDatabase
};
