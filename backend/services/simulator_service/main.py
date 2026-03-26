import asyncio
from .app.simulator import VehicleSimulator
from backend.shared import Topics, get_logger, Producer

logger = get_logger(__name__)

async def run_simulator():
    # Initialize Kafka Producer and Simulator
    producer = Producer()
    await producer.start()
    
    simulator = VehicleSimulator(num_vehicles=500)
    
    logger.info("Starting simulation for 10000 vehicles...")
    
    try:
        while True:
            tasks = []
            for vehicle in simulator.vehicles:
                # Update state
                telemetry = simulator.update_vehicle_state(vehicle)
                
                # Send to Kafka (dict() conversion for Pydantic model)
                tasks.append(producer.send(
                    topic=Topics.VEHICLE_DATA, 
                    data=telemetry.model_dump(mode='json')
                ))
            
            # Run all sends concurrently
            await asyncio.gather(*tasks)
            
            logger.info(f"Sent batch of {len(tasks)} messages")
            
            # Wait 5 seconds before next heartbeat
            await asyncio.sleep(5)
            
    except Exception as e:
        logger.error(f"Simulator error: {e}")
    finally:
        await producer.stop()

if __name__ == "__main__":
    asyncio.run(run_simulator())



