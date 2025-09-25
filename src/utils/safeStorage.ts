export const safeStorage = {
  get<T=any>(key:string): T|undefined {
    try { 
      const v = localStorage.getItem(key); 
      return v ? JSON.parse(v) as T : undefined; 
    }
    catch(e){ 
      console.warn('safeStorage.get error', e); 
      localStorage.removeItem(key); 
      return undefined; 
    }
  },
  set(key:string, val:any){ 
    try{ 
      localStorage.setItem(key, JSON.stringify(val)); 
    } catch(e){ 
      console.warn('safeStorage.set', e); 
    } 
  },
  del(key:string){ 
    try{ 
      localStorage.removeItem(key); 
    } catch{} 
  }
};