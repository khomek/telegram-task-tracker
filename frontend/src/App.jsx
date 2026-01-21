import { useState, useEffect } from 'react'
import axios from 'axios' 
import './App.css'

const tg = window.Telegram?.WebApp  || {};

function App() {
  const [tasks, setTasks] = useState([]); //список задач
  const [title, setTitle] = useState(""); // название задачи
  const [description, setDescription] = useState(""); //ее описание
  const [username, setUsername] = useState("Неизвестный");
  const [userId, setUserId] = useState(null);
   const [debugLog, setDebugLog] = useState("Инициализация...");

   
  useEffect(() => {
    if (!window.Telegram) {
        setDebugLog("ОШИБКА: window.Telegram не найден. Скрипт в index.html не подключен?");
        return;
    }
    tg.ready?.();
    tg.expand?.();
    
    const unsafeData = tg.initDataUnsafe;
    setDebugLog(`Данные TG: ${JSON.stringify(unsafeData, null, 2)}`);
    const user = unsafeData?.user;
    if (user){
      setUsername(user.username ||user.first_name);
      setUserId(user.id);
      fetchTasks(user.id);
    }else{
      setDebugLog((prev) => prev + "\n\n⚠️ Юзер не найден. Включаю тестовый режим (ID=12345).");
      setUsername("Тестовый Юзер");
      setUserId(12345);
      fetchTasks(12345);
    }
    
  }, []); 

  // Функция, которая идет на сервер
  const fetchTasks = async (currentUserId) => {
    try {
      // Делаем GET запрос на /tasks
      const response = await axios.get('/tasks', {headers: {
        'x-telegram-id': currentUserId}
      });
      if(Array.isArray(response.data)) setTasks(response.data);
      else setTasks([]);
    } catch (error){
      setDebugLog((prev) => prev + `\nОшибка GET: ${error.message}`);
    }
  };


  const handleCreateTask = async(e) =>{
    e.preventDefault();
    if(!title.trim()){
      // alert("Введите название задачи!");
      return;
    }
  

  try {
    const response = await axios.post('/tasks', {title:title, description:description},{headers:{'x-telegram-id':userId}});
    setTasks([...tasks, response.data]);
    setTitle("");
    setDescription("");
  } catch (error) {
    alert("Ошибка");
    setDebugLog((prev) => prev + `\nОшибка POST: ${error.message}`);
  }
};

  // Отрисовка (HTML)
  return (
    <div className="app-container">
       {/* --- БЛОК ОТЛАДКИ (ПОТОМ УДАЛИть)--- */}
      <div style={{ background: '#333', color: '#0f0', padding: '10px', fontSize: '12px', marginBottom: '20px', whiteSpace: 'pre-wrap', wordBreak: 'break-all' }}>
        <strong>DEBUG LOG:</strong><br/>
        {debugLog}
      </div>
      {/* ---------------------------------- */}
      <h1 align= 'center'>Привет, {username}!</h1>
      <small style={{color:'gray'}}>Твой ID:{userId||"Не определен"}</small>
      <h1>Твой список задач:</h1>

      {/* создание задачи */}
      <form onSubmit={handleCreateTask} style = {{ marginBottom: '20px', padding: '10px', border: '1px solid #eee' }}>
        <div>
          <input
            type = "text"
            placeholder = "Название задачи"
            value = {title}
            onChange={(e) => setTitle(e.target.value)}
            style={{ padding: '8px', marginRight: '10px' }}
            />
        </div>
        <div style={{ margintop:'10px' }}>
          <input
            type="text"
            placeholder='Описание задачи(необязательно)'
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            style={{ padding: '8px', marginRight: '10px' }} />
        </div>
        <button type="submit" style={{ marginTop: '10px', padding: '8px 16px', cursor: 'pointer'}}>
          Добавить 
        </button>
        </form>
      
      {tasks.length === 0 && <p>Задач пока нет</p>}

      <div className="task-list">
        {tasks.map((task) => (
          <div key={task.id} style={{ border: '1px solid #ccc', margin: '10px', padding: '10px', borderRadius: '5px'}}>
            <h3 style ={{ textDecoration: task.is_completed ? 'line-through' : 'none'}}> 
              {task.title}
            </h3>
            <p>{task.description}</p>
             <small>Статус: {task.is_completed ? "✅ Готово" : "⏳ В процессе"}</small> 
          </div>
        ))}
            
      </div>
    </div>
  )
}

export default App