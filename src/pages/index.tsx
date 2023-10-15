import { Todo } from "@prisma/client";
import { ChangeEvent, useMemo, useState } from "react";
import { toast } from "react-toastify";
import { Spinner } from "~/components/Spinner";
import { useDebounce } from "~/hooks/useDebounce";
import { api } from "~/utils/api";

export default function Home() {
  const [inputValue, setInputValue] = useState<string>('')
  const [isDone, setIsDone] = useState<boolean>(false)
  const deferInputValue = useDebounce(inputValue, 200)

  const apiUtils = api.useContext()
  const { data: todo, isLoading } = api.todo.getTodos.useQuery({ sortWithComplete: isDone })

  const { mutateAsync: createTodo } = api.todo.createTodo.useMutation({
    onSuccess: (res) => {
      setInputValue('')
      toast.success(res.message)
    },
    onError: (error) => {
      toast.error(error.message)
    },
    onSettled: async () => {
      await apiUtils.todo.getTodos.invalidate()
    }
  })
  const { mutateAsync: toggleTodo } = api.todo.toggleTodo.useMutation({
    onMutate: async ({ id, complete }) => {
      await apiUtils.todo.getTodos.cancel()
      const preViousTodo = apiUtils.todo.getTodos.getData({ sortWithComplete: isDone })

      const targetIndex = preViousTodo?.findIndex(todo => todo.id === id)
      apiUtils.todo.getTodos.setData({ sortWithComplete: isDone }, (oldTodos) => {
        return oldTodos?.map((todo, index) => {
          if (index == targetIndex) return { ...todo, complete }
          return todo
        })
      })
      return { preViousTodo }
    },
    onSuccess: (res) => {
      toast.success(res.message)
    },
    onError: (error, _newTod, context) => {
      apiUtils.todo.getTodos.setData(undefined, context?.preViousTodo)
      toast.error(error.message)
    },
    onSettled: async () => {
      await apiUtils.todo.getTodos.invalidate()
    }
  })
  const { mutateAsync: deleteTodo } = api.todo.deleteToto.useMutation({
    onMutate: async ({ id }) => {
      await apiUtils.todo.getTodos.cancel()
      const previousTodo = apiUtils.todo.getTodos.getData({ sortWithComplete: isDone })
      apiUtils.todo.getTodos.setData({ sortWithComplete: isDone }, (oldTodo) => {
        return oldTodo?.filter(todo => todo.id !== id)
      })
      return { previousTodo }
    },
    onSuccess: (res) => {
      toast.success(res.message)
    },
    onError: (error, _newTodo, context) => {
      apiUtils.todo.getTodos.setData({ sortWithComplete: isDone }, context?.previousTodo)
      toast.error(error.message)
    },
    onSettled: async () => {
      await apiUtils.todo.getTodos.invalidate()
    }
  })

  const completedTodoCount = useMemo(() => todo?.filter(todo => todo.complete === true).length ?? 0, [todo])
  const todoCounts = useMemo(() => todo?.length ?? 0, [todo])
  const percentage = useMemo(() => Math.floor((completedTodoCount / todoCounts) * 100) || 0, [completedTodoCount, todoCounts])
  const addBTNDisable = useMemo(() => deferInputValue === '', [deferInputValue])

  const handleAddToDo = async () => {
    await createTodo({
      title: deferInputValue
    })
  }
  const handleFilterDone = () => {
    setIsDone(pre => !pre)
  }
  const handleToggleTodo = async (id: number, complete: boolean) => {
    await toggleTodo({ id, complete })
  }
  const handleDeleteTodo = async (id: number) => {
    await deleteTodo({ id })
  }
  return (
    <>
      {isLoading && (
        <Spinner />
      )}
      <div className="w-screen h-screen bg-gradient-to-b to-[#DFCCFB] from-[#CAEDFF] py-[2rem]">
        <div className="container mx-auto py-[2rem]">
          <div className="flex flex-col gap-1">
            <h1 className="text-5xl text-gray-400">Todo List</h1>
            <p className="text-xl text-gray-400/50">Add things to do</p>
          </div>
          <div className="py-[2rem] my-[0.5rem] border-t-2 border-b-2 border-gray-400">
            <div className="flex items-center  gap-[1rem]" >
              <span className="text-gray-500 text-xl">{percentage}%</span>
              <div className="bg-white h-[1.5rem] flex-1 rounded-full ">
                <div className="h-full  bg-[#8CABFF] rounded-full" style={{ width: `${percentage}%` }}></div>
              </div>
            </div>
            <ul className=" overflow-y-scroll h-[20rem] mt-[2rem] flex flex-col gap-[1rem] px-5">
              {todo?.map(todo => (
                <li key={todo.id} className="bg-white rounded-md shadow-md flex items-center justify-between p-[1rem] gap-[1rem]">
                  <div className="flex items-center mr-4 gap-4">
                    <input
                      id={String(todo.id)}
                      checked={!!todo.complete}
                      onChange={e => handleToggleTodo(todo.id, e.target.checked)}
                      type="checkbox"
                      className="w-4 h-4 text-purple-500 bg-gray-100 border-gray-300 rounded focus:ring-transparent"
                    />
                    <label
                      htmlFor={String(todo.id)}
                      className={`
                    flex-1 text-gray-500 text-lg
                    ${todo.complete && ' line-through'}`}
                    >
                      {todo.title}
                    </label>
                  </div>
                  <div
                    className="text-gray-400 cursor-pointer"
                    onClick={() => handleDeleteTodo(todo.id)}
                  >X</div>
                </li>
              ))}
            </ul>

          </div>
          <div>
            <label className="relative  items-center mb-4 cursor-pointer flex gap-2 justify-end">
              <span className="text-gray-400 text-xl ">More done things to end?</span>
              <input type="checkbox" className="hidden peer" onChange={handleFilterDone} />
              <div className="w-11 h-6 bg-gray-200 rounded-full peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[0.25rem]  after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all  peer-checked:bg-[#8CABFF] peer-checked:after:bg-white after:bg-gray-400/50"></div>
            </label>
            <div className="flex flex-col gap-2">
              <p className="text-xl text-gray-400">Add to  List</p>
              <div className=" flex gap-1">
                <input
                  type="text"
                  className="flex-1 bg-white border-none outline-none focus:shadow-none text-gray-500 rounded-md shadow-md"
                  value={inputValue}
                  onChange={e => {
                    setInputValue(e.target.value)
                  }}
                />
                <button
                  disabled={addBTNDisable}
                  className="w-[4rem] bg-[#8CABFF] flex items-center justify-center text-white text-xl cursor-pointer hover:bg-blue-500 rounded-md shadow-md disabled:bg-gray-300"
                  onClick={handleAddToDo}
                >+</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>

  )
}
