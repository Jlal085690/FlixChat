export function ChatEmpty() {
  return (
    <div className="hidden md:flex md:flex-1 flex-col">
      <div className="h-full flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl text-muted-foreground mb-4">
            <i className="far fa-comments"></i>
          </div>
          <h2 className="text-xl text-foreground mb-2">اختر محادثة للبدء</h2>
          <p className="text-muted-foreground">اضغط على إحدى المحادثات من القائمة للبدء في الدردشة</p>
        </div>
      </div>
    </div>
  );
}
