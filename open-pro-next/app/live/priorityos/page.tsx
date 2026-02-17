export default function PriorityOSLivePage() {
  return (
    <div className="w-full px-4 py-6 sm:px-6">
      <div className="mx-auto mb-4 flex max-w-[1600px] items-center justify-between">
        <h1 className="text-xl font-semibold text-gray-100">PriorityOS Live Demo</h1>
        <a
          href="/agent?template=priorityos&source=live_demo"
          className="btn-sm bg-indigo-600 text-white hover:bg-indigo-500"
        >
          Customize with AI
        </a>
      </div>
      <div className="mx-auto max-w-[1600px] overflow-x-auto rounded-2xl border border-gray-800 bg-black/40">
        <iframe
          title="PriorityOS Live Demo"
          src="/live/priorityos/index.html"
          className="h-[calc(100vh-180px)] min-h-[760px] w-[1400px] min-w-[1400px]"
        />
      </div>
    </div>
  );
}
