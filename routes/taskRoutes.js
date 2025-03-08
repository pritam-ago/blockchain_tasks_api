import express from 'express';
import Task from '../models/Task.js';
import { contract, wallet } from '../server.js';
import { ethers } from 'ethers';
import { parse } from 'dotenv';

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const tasks = await Task.find();
    res.json(tasks);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) return res.status(404).json({ message: 'Task not found' });
    res.json(task);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post("/", async (req, res) => {
  try {
    const { name } = req.body;
    const existingTask = await Task.findOne({ name });
    if (existingTask) {
      return res.status(400).json({ message: "Task name must be unique!" });
    }

    const task = new Task({ name });
    const newTask = await task.save();
    res.status(201).json(newTask);

  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ message: "Task name must be unique!" });
    }
    res.status(500).json({ message: error.message });
  }
});


router.put('/:id/update', async (req, res) => {
  try {
    const { name, completed } = req.body;
    const id = req.params.id; 

    const existingTask = await Task.findById(id);
    if (!existingTask) {
      return res.status(404).json({ message: 'Task not found in DB!' });
    }

    if (name) {
      const nameExists = await Task.findOne({ name, _id: { $ne: id } });
      if (nameExists) {
        return res.status(400).json({ message: 'Task name must be unique!' });
      }
    }

    let txHash = null;
    if (completed !== undefined && completed !== existingTask.completed) {
      const tx = await contract.updateTask(parseInt(id), completed);
      await tx.wait();
      txHash = tx.hash;
    }

    const updatedTask = await Task.findByIdAndUpdate(
      id,
      { 
        ...(name !== undefined && { name }),
        ...(completed !== undefined && { completed })
      },
      { new: true, runValidators: true }
    );

    res.json({ 
      message: 'Task updated successfully!', 
      txHash, 
      task: updatedTask 
    });

  } catch (err) {
    res.status(500).send({ error: err.message });
  }
});



router.post('/:id/verify', async (req, res) => {
  try {
    const taskId = parseInt(req.params.id);
    const { userWallet } = req.body;
    const isCompleted = await contract.getTaskStatus(taskId);
    if (!isCompleted) return res.status(400).json({ message: 'Task is not completed yet!' });

    const message = `Task ID: ${taskId} is completed & verified by Home Plate.`;
    const signature = await wallet.signMessage(message);

    res.json({ message: 'Task verified successfully!', taskId, signature, signedBy: wallet.address, userWallet });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/:id/status', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const status = await contract.getTaskStatus(id);
    res.send({ id, completed: status });
  } catch (err) {
    res.status(500).send({ error: err.message });
  }
});

export default router;
