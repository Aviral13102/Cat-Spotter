class TrainingRouter:
    def __init__(self):
        self.queue = {}
        
    def add_training(self, task_id: str, task_type: str, reason: str):
        if task_id not in self.queue:
            self.queue[task_id] = {
                "module": f"{task_type} Advanced Module",
                "reason": reason
            }
            
    def get_queue(self):
        return list(self.queue.values())
