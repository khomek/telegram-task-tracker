import { useState, useEffect } from 'react'
import axios from 'axios' 
import './App.css'

const tg = window.Telegram?.WebApp  || {};
const formatDate = (dateObj) => {
  const year = dateObj.getFullYear();
  const month = String(dateObj.getMonth()+1).padStart(2,'0');
  const day = String(dateObj.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

function App() {
  const [tasks, setTasks] = useState([]); //список задач
  const [title, setTitle] = useState(""); // название задачи
  const [description, setDescription] = useState(""); //ее описание
  const [username, setUsername] = useState("Неизвестный");
  const [userId, setUserId] = useState(null);
  const [debugLog, setDebugLog] = useState("Инициализация...");
  const [tagInput, setTagInput] = useState("");
  const [currentDate, setCurrentDate] = useState(new Date());


   
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
      fetchTasks(user.id, currentDate);
    }else{
      setDebugLog((prev) => prev + "\n\n⚠️ Юзер не найден. Включаю тестовый режим (ID=12345).");
      setUsername("Тестовый Юзер");
      setUserId(12345);
      fetchTasks(12345, currentDate);
    }
    
  }, [currentDate]); //  зависимость от даты

  // Функция, которая идет на сервер
  const fetchTasks = async (userId, dateObj) => {
    try {
      const dateStr = formatDate(dateObj); 
      // Делаем GET запрос на /tasks
      const response = await axios.get('/tasks', {
        headers: {'x-telegram-id': userId},
        params:{target_date:dateStr}
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
  const tagsArray = tagInput
      .split(',')
      .map(tag => tag.trim())
      .filter(tag => tag.length > 0);
  const dateToSend = formatDate(currentDate);

  try {
    const response = await axios.post('/tasks', {title:title, description:description, tags: tagsArray, due_date: dateToSend},{headers:{'x-telegram-id':userId}});
    setTasks([...tasks, response.data]);
    setTitle("");
    setDescription("");
    setTagInput("");
  } catch (error) {
    alert("Ошибка");
    setDebugLog((prev) => prev + `\nОшибка POST: ${error.message}`);
  }
};

const changeDate = (days) => {
    const newDate = new Date(currentDate);
    newDate.setDate(currentDate.getDate() + days);
    setCurrentDate(newDate);
};

// генерация цвета тега
const getTagColor = (tagName) => {
    let hash = 0;
    for (let i = 0; i < tagName.length; i++) {
        hash = tagName.charCodeAt(i) + ((hash << 5) - hash);
    }
    const h = Math.abs(hash) % 360; 
    return `hsl(${h}, 70%, 80%)`;
};

  const handleDeleteTask = async (taskId) => {
    try{
      await axios.delete(`/tasks/${taskId}`, {
        headers: {'x-telegram-id': userId}
      });
      setTasks((prev) => prev.filter((task) => task.id !== taskId));
    } catch (error) {
      setDebugLog((prev) => prev+`/nОшибка DELETE: ${error.message}`);
    }
  };

  const handleChangeStatus = async (taskId, newStatus) => {
    try{
      await axios.patch(`/tasks/${taskId}?status=${newStatus}`, null, {
        headers: {'x-telegram-id': userId}
      });

      setTasks((prev) => prev.map((task) => {
        if (task.id === taskId){
          return {...task, status: newStatus};
        }
        return task;
      }));
    } catch(error){
      setDebugLog((prev) => prev +  `\nОшибка PATCH: ${error.message}`);
    }
  };

  // Фильтрация задач по колонкам
  const todoTasks = tasks.filter(t => t.status === 'todo');
  const inProgressTasks = tasks.filter(t => t.status === 'in_progress');
  const doneTasks = tasks.filter(t => t.status === 'done');

  // одна карточка
  const TaskCard = ({ task }) => (
    <div className="task-card">
      <h3 className="task-title">{task.title}</h3>
      {task.tags && task.tags.length > 0 && (
        <div className="task-tags">
          {task.tags.map(tag => (
            <span 
              key={tag.id} 
              className="tag-badge"
              style={{ backgroundColor: getTagColor(tag.title) }}
            >
              {tag.title}
            </span>
          ))}
        </div>
      )}
      
      {task.description && <p className="task-desc">{task.description}</p>}
      
      <div className="card-actions">
        {/* Кнопка Удалить */}
        <button 
          className="btn-action btn-delete" 
          onClick={() => handleDeleteTask(task.id)}
        >
          🗑
        </button>

        {/* Кнопки перемещения */}
        <div style={{ display: 'flex', gap: '5px' }}>
         
          {task.status === 'todo' && (
            <button 
              className="btn-action btn-move" 
              onClick={() => handleChangeStatus(task.id, 'in_progress')}
            >
              Начать ▶
            </button>
          )}

          {task.status === 'in_progress' && (
            <>
              <button 
                className="btn-action btn-move" 
                onClick={() => handleChangeStatus(task.id, 'todo')}
              >
                ◀
              </button>
              <button 
                className="btn-action btn-move"
                style={{ background: '#d1f2eb', color: '#27ae60' }} 
                onClick={() => handleChangeStatus(task.id, 'done')}
              >
                Готово ✅
              </button>
            </>
          )}

          {task.status === 'done' && (
            <button 
              className="btn-action btn-move" 
              onClick={() => handleChangeStatus(task.id, 'in_progress')}
            >
              ↺ Вернуть
            </button>
          )}
        </div>
      </div>
    </div>
  );

  // Отрисовка (HTML)
  return (
    <div className="app-container">
      <h1>Task Tracker</h1>
      <p style = {{textAlign: 'center', color: '#999', fontSize: '12px'}}>
        {username} (ID: {userId})
      </p>

      {/* --- Блок Навигации по Датам --- */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '20px', marginBottom: '20px' }}>
        
        <button 
          onClick={() => changeDate(-1)}
          style={{ padding: '10px 15px', borderRadius: '10px', border: 'none', background: '#e0e0e0', cursor: 'pointer', fontSize: '18px' }}
        >
          ◀
        </button>

        <h2 style={{ margin: 0, minWidth: '150px', textAlign: 'center' }}>
          {currentDate.toLocaleDateString('ru-RU', { day: 'numeric', month: 'long' })}
        </h2>

        <button 
          onClick={() => changeDate(1)}
          style={{ padding: '10px 15px', borderRadius: '10px', border: 'none', background: '#e0e0e0', cursor: 'pointer', fontSize: '18px' }}
        >
          ▶
        </button>
      </div>
      
      {/* Кнопка "Сегодня", если ушли далеко */}
      <div style={{textAlign: 'center', marginBottom: '20px'}}>
         <button onClick={() => setCurrentDate(new Date())} style={{background: 'none', border:'1px solid #ccc', padding: '5px 10px', borderRadius:'15px', cursor:'pointer'}}>
            Вернуться к "Сегодня"
         </button>
      </div>

      {/* создание задачи */}
      <form onSubmit={handleCreateTask} className='create-task-form'> 
        <input
          type="text"
          placeholder="Что нужно сделать?"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
        <input
          type="text"
          placeholder="Описание (необязательно)"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
         <input
          type="text"
          placeholder="Теги (через запятую: работа, срочно)"
          value={tagInput}
          onChange={(e) => setTagInput(e.target.value)}
        />
        <button type="submit" className="add-btn">Добавить задачу</button>
      </form>
      
      {/* Канбан Доска */}
      <div className="kanban-board">
        
        {/* Колонка TODO */}
        <div className="kanban-column">
          <div className="column-header">
            <span className="dot" style={{background: 'var(--color-todo)'}}></span>
            Нужно сделать ({todoTasks.length})
          </div>
          {todoTasks.map(task => <TaskCard key={task.id} task={task} />)}
          {todoTasks.length === 0 && <div style={{color:'#999', fontSize:'12px', textAlign:'center'}}>Пусто</div>}
        </div>

        {/* Колонка IN PROGRESS */}
        <div className="kanban-column">
          <div className="column-header">
            <span className="dot" style={{background: 'var(--color-progress)'}}></span>
            В процессе ({inProgressTasks.length})
          </div>
          {inProgressTasks.map(task => <TaskCard key={task.id} task={task} />)}
          {inProgressTasks.length === 0 && <div style={{color:'#999', fontSize:'12px', textAlign:'center'}}>Пусто</div>}
        </div>

        {/* Колонка DONE */}
        <div className="kanban-column">
          <div className="column-header">
            <span className="dot" style={{background: 'var(--color-done)'}}></span>
            Готово ({doneTasks.length})
          </div>
          {doneTasks.map(task => <TaskCard key={task.id} task={task} />)}
          {doneTasks.length === 0 && <div style={{color:'#999', fontSize:'12px', textAlign:'center'}}>Пусто</div>}
        </div>

      </div>
    </div>
  )
}

export default App